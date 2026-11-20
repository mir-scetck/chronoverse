import { z } from 'zod';
import type { AIService, ChatRequest, ChatResponse } from '../contracts';
import { matchScriptedResponse } from './scriptedBaghdad';

const DialogueSegmentSchema = z.object({
  text: z.string().min(1),
  tag: z.enum(['documented', 'traditional', 'dramatized', 'uncertain']),
  translation: z.string().optional(),
});

const DialogueTurnSchema = z.object({
  segments: z.array(DialogueSegmentSchema).min(1),
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
  followUps: z.array(z.string()).default([]),
  refusal: z.enum(['anachronism', 'out-of-scope', 'unsafe', 'unknown']).optional(),
});

const ChatResponseSchema = z.object({
  turn: DialogueTurnSchema,
  mode: z.enum(['gemini', 'offline']),
  discoveredFactIds: z.array(z.string()).optional(),
});

export class ClientAIService implements AIService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return matchScriptedResponse(request);
      }
      const json: unknown = await res.json();
      const parsed = ChatResponseSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return matchScriptedResponse(request);
    } catch {
      return matchScriptedResponse(request);
    }
  }
}

export const aiService = new ClientAIService();
