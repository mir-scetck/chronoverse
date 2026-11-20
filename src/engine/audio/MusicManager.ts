import type { MusicTrack, World } from '../../contracts';
import { eventBus } from '../../services/eventBus';

type MaqamKind = MusicTrack['scale'];

// Frequencies (Hz) anchored around C3/D3 for warm, non-fatiguing Oud & Ney phrases
const MAQAM_SCALES: Record<MaqamKind, number[]> = {
  // Hijaz: D, Eb, F#, G, A, Bb, C, D
  hijaz: [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66],
  // Rast: C, D, E-quarter-flat (~318Hz), F, G, A, B-quarter-flat, C
  rast: [130.81, 146.83, 160.2, 174.61, 196.0, 220.0, 240.3, 261.63],
  // Bayati: D, E-half-flat (~160.2), F, G, A, Bb, C, D
  bayati: [146.83, 160.2, 174.61, 196.0, 220.0, 233.08, 261.63, 293.66],
  // Nahawand: C, D, Eb, F, G, Ab, Bb, C
  nahawand: [130.81, 146.83, 155.56, 174.61, 196.0, 207.65, 233.08, 261.63],
};

const MOTIF_PATTERNS = [
  [0, 2, 3, 4, 3, 2, 1, 0],
  [4, 5, 4, 3, 2, 3, 1, 0],
  [0, 3, 4, 7, 5, 4, 3, 2],
  [2, 3, 4, 2, 1, 2, 0, 0],
];

export class MusicManager {
  private ctx: AudioContext | null = null;
  private busGain: GainNode | null = null;
  private synthGain: GainNode | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private htmlSource: MediaElementAudioSourceNode | null = null;

  private tracks: MusicTrack[] = [];
  private activeTrack: MusicTrack | null = null;
  private stepTimer: ReturnType<typeof setInterval> | null = null;
  private stepIndex = 0;
  private motifIndex = 0;
  private ducked = false;
  private baseVolume = 0.55;
  private enabled = false;
  private usingRealMp3 = false;

  attach(ctx: AudioContext, outputNode: AudioNode): void {
    this.ctx = ctx;
    if (!this.busGain) {
      this.busGain = ctx.createGain();
      this.busGain.gain.value = 0;
      this.busGain.connect(outputNode);
    }
    if (!this.synthGain) {
      this.synthGain = ctx.createGain();
      this.synthGain.gain.value = 1;
      this.synthGain.connect(this.busGain);
    }
    this.applyGain();
  }

  setWorldTracks(world: World): void {
    this.tracks = world.soundscape.musicTracks ?? [];
    if (!this.activeTrack && this.tracks.length > 0) {
      void this.crossfadeToLocation(this.tracks[0].locationId);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      if (!this.activeTrack && this.tracks.length > 0) {
        void this.crossfadeToLocation(this.tracks[0].locationId);
      } else {
        this.ensureLoopRunning();
      }
    } else {
      this.stopLoop();
      if (this.htmlAudio) {
        this.htmlAudio.pause();
      }
    }
    this.applyGain();
  }

  setVolume(vol: number): void {
    this.baseVolume = Math.max(0, Math.min(1, vol));
    this.applyGain();
  }

  setDucked(ducked: boolean): void {
    this.ducked = ducked;
    this.applyGain();
  }

  private applyGain(): void {
    if (!this.ctx || !this.busGain) return;
    const now = this.ctx.currentTime;
    const duckFactor = this.ducked ? 0.22 : 1.0; // ~ -13 dB ducking during narration/video
    const target = this.enabled ? (this.baseVolume ** 2) * 0.45 * duckFactor : 0;
    this.busGain.gain.setTargetAtTime(target, now, 0.28);
  }

  async crossfadeToLocation(locationId: string | null): Promise<void> {
    if (this.tracks.length === 0) return;
    const next =
      (locationId && this.tracks.find((t) => t.locationId === locationId)) || this.tracks[0];
    if (!next) return;

    const isSame = this.activeTrack?.id === next.id;
    this.activeTrack = next;
    eventBus.emit('audio:music:change', {
      trackId: next.id,
      title: next.title,
      locationId: next.locationId,
    });

    if (isSame && (this.stepTimer || this.usingRealMp3)) return;

    // Gentle 2.5s dip & swell crossfade
    if (this.ctx && this.synthGain) {
      const now = this.ctx.currentTime;
      this.synthGain.gain.cancelScheduledValues(now);
      this.synthGain.gain.setValueAtTime(this.synthGain.gain.value, now);
      this.synthGain.gain.linearRampToValueAtTime(0.05, now + 0.75);
      this.synthGain.gain.linearRampToValueAtTime(1.0, now + 2.5);
    }

    // Check cleanly if user provided a real MP3 file
    let mp3Available = false;
    if (typeof fetch !== 'undefined' && next.src) {
      try {
        const res = await fetch(next.src, { method: 'HEAD' });
        const ct = res.headers?.get?.('content-type') ?? '';
        mp3Available = res.ok && ct.startsWith('audio/');
      } catch {
        mp3Available = false;
      }
    }

    if (mp3Available && this.ctx && this.busGain) {
      this.stopLoop();
      this.usingRealMp3 = true;
      this.startHtmlTrack(next.src);
    } else {
      this.usingRealMp3 = false;
      if (this.htmlAudio) {
        this.htmlAudio.pause();
      }
      if (this.enabled) {
        this.ensureLoopRunning();
      }
    }
  }

  private startHtmlTrack(src: string): void {
    if (!this.ctx || !this.busGain) return;
    if (!this.htmlAudio) {
      const audio = new Audio();
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      this.htmlAudio = audio;
      try {
        this.htmlSource = this.ctx.createMediaElementSource(audio);
        this.htmlSource.connect(this.busGain);
      } catch {
        // ignore if media element already attached
      }
    }
    this.htmlAudio.src = src;
    if (this.enabled) {
      void this.htmlAudio.play().catch(() => {
        this.usingRealMp3 = false;
        this.ensureLoopRunning();
      });
    }
  }

  private ensureLoopRunning(): void {
    if (this.stepTimer || this.usingRealMp3 || !this.activeTrack) return;
    const bpm = this.activeTrack.bpm || 68;
    const beatMs = Math.round((60 / bpm) * 1000 * 0.75);

    this.stepTimer = setInterval(() => {
      if (!this.ctx || !this.synthGain || !this.enabled || this.ctx.state !== 'running') return;
      const track = this.activeTrack;
      if (!track) return;

      const scale = MAQAM_SCALES[track.scale] ?? MAQAM_SCALES.hijaz;
      const pattern = MOTIF_PATTERNS[this.motifIndex % MOTIF_PATTERNS.length];
      const deg = pattern[this.stepIndex % pattern.length];
      const freq = scale[deg % scale.length];

      // Plucked Oud note on every beat; soft Ney breath pad every 4th beat
      this.playOudPluck(freq);
      if (this.stepIndex % 4 === 0) {
        this.playNeyPad(scale[0] * 2, (beatMs / 1000) * 3.5);
      }

      this.stepIndex += 1;
      if (this.stepIndex >= pattern.length) {
        this.stepIndex = 0;
        this.motifIndex += 1;
      }
    }, beatMs);
  }

  private playOudPluck(freq: number): void {
    if (!this.ctx || !this.synthGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 2, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + 0.65);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.18, now + 0.014);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.25;

    osc.connect(filter);
    sub.connect(subGain);
    subGain.connect(filter);
    filter.connect(env);
    env.connect(this.synthGain);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 1.0);
    sub.stop(now + 1.0);
  }

  private playNeyPad(freq: number, durSec: number): void {
    if (!this.ctx || !this.synthGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.055, now + 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

    osc.connect(env);
    env.connect(this.synthGain);
    osc.start(now);
    osc.stop(now + durSec + 0.05);
  }

  playQuizChime(kind: 'correct' | 'gentle' | 'complete'): void {
    if (!this.ctx || !this.busGain || this.ctx.state !== 'running') return;
    const notes =
      kind === 'complete'
        ? [293.66, 369.99, 440.0, 587.33]
        : kind === 'correct'
          ? [293.66, 369.99, 440.0]
          : [261.63, 246.94];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.busGain) return;
      const start = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(0.11, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(g);
      g.connect(this.busGain);
      osc.start(start);
      osc.stop(start + 0.48);
    });
  }

  private stopLoop(): void {
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  dispose(): void {
    this.stopLoop();
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.src = '';
      this.htmlAudio = null;
    }
    this.htmlSource?.disconnect();
    this.htmlSource = null;
    this.busGain?.disconnect();
    this.busGain = null;
    this.synthGain?.disconnect();
    this.synthGain = null;
    this.ctx = null;
  }
}
