import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import type { ChatRequest, ChatResponse, DialogueTurn } from './src/contracts/index.ts';
import { BAGHDAD_KNOWLEDGE } from './src/data/knowledge/baghdad-characters.ts';
import { matchScriptedResponse } from './src/ai/scriptedBaghdad.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const AI_MODEL = process.env.AI_MODEL || 'gemini-4-hydrogen';
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MINUTE || 36);

// Strip ASCII control characters while preserving Arabic & punctuation
function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

const ChatRequestSchema = z.object({
  worldId: z.enum(['baghdad', 'kingston', 'granada', 'samarkand']),
  characterId: z.string().min(1).max(64),
  language: z.enum(['en', 'ar']),
  message: z.string().min(1).max(500).transform(sanitizeText),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().max(600).transform(sanitizeText),
      }),
    )
    .max(8)
    .default([]),
  context: z.object({
    currentLocationId: z.string().nullable(),
    nearbyObjectIds: z.array(z.string()).max(16).default([]),
    discoveredFactIds: z.array(z.string()).max(64).default([]),
    watchedStoryIds: z.array(z.string()).max(16).default([]),
  }),
  includeTranslation: z.boolean().default(true),
});

const DialogueTurnSchema = z.object({
  segments: z
    .array(
      z.object({
        text: z.string().min(1),
        tag: z.enum(['documented', 'traditional', 'dramatized', 'uncertain']),
        translation: z.string().optional(),
      }),
    )
    .min(1),
  emotion: z.enum(['neutral', 'warm', 'stern', 'thoughtful', 'amused', 'sad', 'excited']),
  gesture: z.enum([
    'none',
    'greet',
    'explain',
    'emphasize',
    'think',
    'welcome',
    'point',
    'bow',
    'sad-sigh',
  ]),
  storyId: z.string().optional(),
  followUps: z.array(z.string()).max(4).default([]),
  refusal: z.enum(['anachronism', 'out-of-scope', 'unsafe', 'unknown']).optional(),
});

const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: 'Reply sentence or short clause in clear Modern Standard Arabic (الفصحى).',
          },
          tag: {
            type: Type.STRING,
            enum: ['documented', 'traditional', 'dramatized', 'uncertain'],
          },
          translation: {
            type: Type.STRING,
            description: 'Concise accurate English translation of text.',
          },
        },
        required: ['text', 'tag'],
      },
    },
    emotion: {
      type: Type.STRING,
      enum: ['neutral', 'warm', 'stern', 'thoughtful', 'amused', 'sad', 'excited'],
    },
    gesture: {
      type: Type.STRING,
      enum: ['none', 'greet', 'explain', 'emphasize', 'think', 'welcome', 'point', 'bow', 'sad-sigh'],
    },
    storyId: {
      type: Type.STRING,
      description:
        'Optional exact story ID ONLY if relevant: embassy-to-charlemagne, paper-and-the-copyists, or a-night-of-tales.',
    },
    followUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 3 short suggested follow-up questions in Modern Standard Arabic.',
    },
    refusal: {
      type: Type.STRING,
      enum: ['anachronism', 'out-of-scope', 'unsafe', 'unknown'],
    },
  },
  required: ['segments', 'emotion', 'gesture', 'followUps'],
};

const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (rateBuckets.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_PER_MIN) {
    rateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

function buildSystemInstruction(req: ChatRequest): string {
  const knowledge =
    BAGHDAD_KNOWLEDGE[req.characterId] ?? BAGHDAD_KNOWLEDGE['harun-al-rashid'];
  const factsText = knowledge.groundingFacts
    .map((f) => `- [${f.id} | ${f.tag}] ${f.text} (${f.source})`)
    .join('\n');
  const avoidText = knowledge.mustAvoid.map((a) => `- ${a}`).join('\n');

  return [
    `You are portraying ${knowledge.personaSummary} in CHRONOVERSE, set in ${knowledge.city} around ${knowledge.worldYear} CE.`,
    `Speaking style: ${knowledge.speakingStyle}`,
    `CRITICAL LANGUAGE RULE: Every "segments[].text" MUST be written strictly in natural, dignified Modern Standard Arabic (العربية الفصحى), even if the visitor writes in English.`,
    req.includeTranslation
      ? `Provide concise English translations in "segments[].translation".`
      : `English translations in "segments[].translation" may be concise or omitted.`,
    `HISTORICAL HONESTY: This palace is a composite historical evocation (not an archaeological survey). Never invent dates, battles, or events after 800 CE (you do NOT know the fall of the Barmakids in 803, Abul-Abbas reaching Aachen in 802, or the 807 water clock arrival). If asked about modern technology or future eras, refuse politely in character with refusal="anachronism" and tag="dramatized".`,
    `If asked whether you are real or a simulation, state plainly in Arabic that this is an imagined historical simulation of ~800 CE (tag="dramatized").`,
    `Never depict prophets or generate religious recitation.`,
    `Valid storyId values (only emit when directly relevant and unwatched [${req.context.watchedStoryIds.join(', ')}]): "embassy-to-charlemagne", "paper-and-the-copyists", "a-night-of-tales".`,
    `Current visitor locationId: ${req.context.currentLocationId ?? 'unknown'}. Nearby objects: ${req.context.nearbyObjectIds.join(', ') || 'none'}.`,
    `Things you MUST avoid:\n${avoidText}`,
    `Grounding facts:\n${factsText}`,
    `Keep replies concise (2 to 4 sentences total across segments) and provide 2-3 Arabic followUp questions.`,
  ].join('\n\n');
}

function matchFactsFromReply(characterId: string, turn: DialogueTurn): string[] {
  const knowledge = BAGHDAD_KNOWLEDGE[characterId];
  if (!knowledge) return [];
  const combined = turn.segments
    .map((s) => `${s.text} ${s.translation ?? ''}`)
    .join(' ')
    .toLowerCase();
  const matched: string[] = [];

  if (combined.includes('762') || combined.includes('المنصور')) matched.push('baghdad-founded-762');
  if (combined.includes('786') || combined.includes('ست وثمانين')) matched.push('harun-reign-786');
  if (combined.includes('raqqa') || combined.includes('الرقة')) matched.push('raqqa-court-796');
  if (combined.includes('charlemagne') || combined.includes('قارله') || combined.includes('الفرنجة')) {
    matched.push('charlemagne-envoys');
  }
  if (combined.includes('paper') || combined.includes('ورق')) matched.push('paper-samarkand-baghdad');
  if (combined.includes('zubayda') || combined.includes('زبيدة')) matched.push('zubayda-patronage');
  if (combined.includes('mazalim') || combined.includes('مظالم')) matched.push('justice-mazalim');
  if (combined.includes('astrolabe') || combined.includes('أسطرلاب')) matched.push('astrolabe-use');
  if (combined.includes('dinar') || combined.includes('دينار')) matched.push('abbasid-dinar');

  return matched.filter((id) => knowledge.groundingFacts.some((f) => f.id === id));
}

async function generateWithGemini(req: ChatRequest): Promise<ChatResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 8) {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const historyLines = req.history
    .slice(-8)
    .map((h) => `${h.role === 'user' ? 'Visitor' : 'Character'}: ${h.text}`)
    .join('\n');
  const prompt = historyLines
    ? `Recent dialogue:\n${historyLines}\n\nVisitor message: ${req.message}`
    : `Visitor message: ${req.message}`;

  const systemInstruction = buildSystemInstruction(req);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      });

      const rawText = response.text;
      if (!rawText) continue;
      const parsedJson: unknown = JSON.parse(rawText);
      const validated = DialogueTurnSchema.safeParse(parsedJson);
      if (validated.success) {
        return {
          turn: validated.data,
          mode: 'gemini',
          discoveredFactIds: matchFactsFromReply(req.characterId, validated.data),
        };
      }
    } catch {
      // Retry once on malformed response or transient error
    }
  }

  return null;
}

async function startServer() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    }),
  );
  app.use(cors());
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    next();
  });

  app.use(express.json({ limit: '8kb' }));

  app.get('/api/health', (_req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length >= 8);
    res.json({
      ok: true,
      mode: hasKey ? 'gemini' : 'offline',
      model: hasKey ? AI_MODEL : 'scripted-baghdad-v1',
    });
  });

  app.post('/api/chat', async (req, res) => {
    const ip = req.ip || 'local';
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'rate_limited' });
      return;
    }

    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.message.length === 0) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }

    const chatReq = parsed.data as ChatRequest;
    const geminiResult = await generateWithGemini(chatReq);
    if (geminiResult) {
      res.json(geminiResult);
      return;
    }

    // Graceful offline scripted fallback
    const offlineResult = matchScriptedResponse(chatReq);
    res.json(offlineResult);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CHRONOVERSE server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
