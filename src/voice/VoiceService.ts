import type { VoiceProfile, VoiceService } from '../contracts';
import { eventBus } from '../services/eventBus';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultItem>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function chunkSpeechText(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const parts = cleaned.split(/(?<=[.!?؟،;؛])\s+/u);
  const chunks: string[] = [];
  let current = '';

  for (const part of parts) {
    if (!part) continue;
    if (part.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      // Split long clause on spaces
      const words = part.split(' ');
      let buf = '';
      for (const w of words) {
        if ((buf + ' ' + w).trim().length > maxLen) {
          if (buf) chunks.push(buf);
          buf = w;
        } else {
          buf = (buf + ' ' + w).trim();
        }
      }
      if (buf) chunks.push(buf);
      continue;
    }

    if ((current + ' ' + part).trim().length <= maxLen) {
      current = (current + ' ' + part).trim();
    } else {
      if (current) chunks.push(current);
      current = part;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export class WebVoiceService implements VoiceService {
  private preferredVoiceUri = '';
  private voiceVolume = 0.9;
  private muted = false;
  private activeSpeechToken = 0;
  private recognition: SpeechRecognitionLike | null = null;
  private lipTimer: ReturnType<typeof setInterval> | null = null;
  private fallbackEndTimer: ReturnType<typeof setTimeout> | null = null;

  setPreferences(opts: { preferredVoiceUri?: string; volume?: number; muted?: boolean }): void {
    if (opts.preferredVoiceUri !== undefined) this.preferredVoiceUri = opts.preferredVoiceUri;
    if (opts.volume !== undefined) this.voiceVolume = opts.volume;
    if (opts.muted !== undefined) this.muted = opts.muted;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  async waitForVoices(timeoutMs = 800): Promise<SpeechSynthesisVoice[]> {
    const existing = this.getVoices();
    if (existing.length > 0 || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return existing;
    }
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.speechSynthesis.removeEventListener('voiceschanged', finish);
        resolve(this.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', finish);
      setTimeout(finish, timeoutMs);
    });
  }

  private pickVoice(
    voices: SpeechSynthesisVoice[],
    profile: VoiceProfile,
  ): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    if (this.preferredVoiceUri) {
      const explicit = voices.find((v) => v.voiceURI === this.preferredVoiceUri);
      if (explicit) return explicit;
    }

    for (const prefName of profile.preferredVoiceNames) {
      const found = voices.find((v) =>
        v.name.toLowerCase().includes(prefName.toLowerCase()),
      );
      if (found) return found;
    }

    const langPrefix = profile.lang.split('-')[0];
    const sameLang = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()),
    );
    if (sameLang.length > 0) {
      return sameLang.find((v) => v.lang.toLowerCase() === profile.lang.toLowerCase()) ?? sameLang[0];
    }

    return null;
  }

  async speak(text: string, profile: VoiceProfile, characterId: string): Promise<void> {
    this.stopSpeaking();
    const token = ++this.activeSpeechToken;
    const chunks = chunkSpeechText(text, 180);
    if (chunks.length === 0) return;

    const synthAvailable =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    eventBus.emit('voice:speak:start', { characterId });

    // Start 90ms procedural lip-sync fallback alongside native boundary events
    let lipPhase = 0;
    this.lipTimer = setInterval(() => {
      if (token !== this.activeSpeechToken) return;
      lipPhase += 0.7;
      const open = 0.25 + 0.65 * Math.abs(Math.sin(lipPhase) * Math.cos(lipPhase * 0.43));
      eventBus.emit('voice:lip-sync', { characterId, open });
    }, 90);

    try {
      if (!synthAvailable || this.muted || this.voiceVolume <= 0.02) {
        // Silent reading duration pacing so animations & lip-sync still play naturally
        const approxMs = Math.min(8000, Math.max(1200, text.length * 42));
        await new Promise<void>((resolve) => {
          this.fallbackEndTimer = setTimeout(resolve, approxMs);
        });
        return;
      }

      const voices = await this.waitForVoices();
      if (token !== this.activeSpeechToken) return;
      const chosenVoice = this.pickVoice(voices, profile);

      for (let i = 0; i < chunks.length; i += 1) {
        if (token !== this.activeSpeechToken) break;
        const chunk = chunks[i];

        await new Promise<void>((resolve) => {
          let settled = false;
          const finishChunk = () => {
            if (settled) return;
            settled = true;
            if (this.fallbackEndTimer) {
              clearTimeout(this.fallbackEndTimer);
              this.fallbackEndTimer = null;
            }
            resolve();
          };

          const utt = new SpeechSynthesisUtterance(chunk);
          utt.lang = chosenVoice?.lang || profile.lang;
          if (chosenVoice) utt.voice = chosenVoice;
          utt.pitch = profile.pitch;
          utt.rate = profile.rate;
          utt.volume = Math.max(0, Math.min(1, this.voiceVolume));

          utt.onboundary = () => {
            if (token !== this.activeSpeechToken) return;
            eventBus.emit('voice:lip-sync', {
              characterId,
              open: 0.45 + Math.random() * 0.5,
            });
          };
          utt.onend = finishChunk;
          utt.onerror = finishChunk;

          // Safety timer if browser speechSynthesis drops onend event (common on Linux/headless)
          const safetyMs = Math.max(2200, Math.round((chunk.length / profile.rate) * 110));
          this.fallbackEndTimer = setTimeout(finishChunk, safetyMs);

          try {
            window.speechSynthesis.speak(utt);
          } catch {
            finishChunk();
          }
        });

        if (i < chunks.length - 1 && token === this.activeSpeechToken && profile.pauseMs > 0) {
          await new Promise((r) => setTimeout(r, profile.pauseMs));
        }
      }
    } finally {
      if (this.lipTimer) {
        clearInterval(this.lipTimer);
        this.lipTimer = null;
      }
      if (this.fallbackEndTimer) {
        clearTimeout(this.fallbackEndTimer);
        this.fallbackEndTimer = null;
      }
      eventBus.emit('voice:lip-sync', { characterId, open: 0 });
      if (token === this.activeSpeechToken) {
        eventBus.emit('voice:speak:end', { characterId });
      }
    }
  }

  stopSpeaking(): void {
    this.activeSpeechToken += 1;
    if (this.lipTimer) {
      clearInterval(this.lipTimer);
      this.lipTimer = null;
    }
    if (this.fallbackEndTimer) {
      clearTimeout(this.fallbackEndTimer);
      this.fallbackEndTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  isSupportedRecognition(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  startRecognition(options: {
    lang: string;
    onInterim: (text: string) => void;
    onFinal: (text: string) => void;
    onError: (code: string) => void;
  }): void {
    this.stopRecognition();
    if (typeof window === 'undefined') {
      options.onError('unsupported');
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      options.onError('unsupported');
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = options.lang || 'ar-EG';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      let sentFinal = false;
      rec.onresult = (ev) => {
        let interim = '';
        let finalStr = '';
        for (let i = 0; i < ev.results.length; i += 1) {
          const item = ev.results[i];
          const text = item[0]?.transcript ?? '';
          if (item.isFinal) {
            finalStr += text;
          } else {
            interim += text;
          }
        }
        if (interim) options.onInterim(interim);
        if (finalStr && !sentFinal) {
          sentFinal = true;
          options.onFinal(finalStr.trim());
        }
      };

      rec.onerror = (ev) => {
        options.onError(ev.error || 'recognition-error');
      };

      rec.onend = () => {
        this.recognition = null;
      };

      this.recognition = rec;
      rec.start();
    } catch {
      options.onError('unsupported');
    }
  }

  stopRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}

export const voiceService = new WebVoiceService();
