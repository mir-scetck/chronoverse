import type { AudioEmitterRef, World } from '../../contracts';
import { MusicManager } from './MusicManager';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private envGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private peopleGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private music = new MusicManager();

  private noiseBuffer: AudioBuffer | null = null;
  private bedFilter: BiquadFilterNode | null = null;
  private bedGain: GainNode | null = null;
  private emitterNodes: Array<{ spec: AudioEmitterRef; panner: PannerNode; gain: GainNode }> = [];

  private volumes = { environment: 0.7, voices: 0.9, people: 0.65, music: 0.55, muted: false };
  private ducked = false;
  private stepAccum = 0;
  private birdTimer = 2.0;
  private currentLocationId: string | null = null;

  unlock(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.envGain = this.ctx.createGain();
      this.voiceGain = this.ctx.createGain();
      this.peopleGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.envGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);
      this.peopleGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.music.attach(this.ctx, this.musicGain);
      this.noiseBuffer = this.createPinkNoiseBuffer(this.ctx);
      this.setupAmbientBed();
      this.applyVolumes();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.music.setEnabled(!this.volumes.muted && this.volumes.music > 0.01);
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
    }
    return buffer;
  }

  private setupAmbientBed(): void {
    if (!this.ctx || !this.noiseBuffer || !this.envGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 0.7;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.16;

    // Gentle wind LFO modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.14;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.envGain);

    src.start();
    lfo.start();
    this.bedFilter = filter;
    this.bedGain = gain;
  }

  setupWorld(world: World): void {
    this.clearEmitters();
    this.music.setWorldTracks(world);
    if (!this.ctx || !this.noiseBuffer || !this.envGain || !this.peopleGain) return;

    for (const em of world.soundscape.emitters) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (em.kind === 'fountain') {
        filter.type = 'highpass';
        filter.frequency.value = 950;
      } else if (em.kind === 'crowd') {
        filter.type = 'bandpass';
        filter.frequency.value = 520;
        filter.Q.value = 1.4;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 440;
      }

      const panner = this.ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 2;
      panner.maxDistance = em.maxDistance;
      panner.positionX.value = em.position.x;
      panner.positionY.value = em.position.y;
      panner.positionZ.value = em.position.z;

      const gain = this.ctx.createGain();
      gain.gain.value = em.volume * 0.28;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(em.kind === 'crowd' ? this.peopleGain : this.envGain);
      src.start();

      this.emitterNodes.push({ spec: em, panner, gain });
    }
  }

  setLocation(locationId: string | null): void {
    this.currentLocationId = locationId;
    void this.music.crossfadeToLocation(locationId);
    if (!this.ctx || !this.bedFilter || !this.bedGain) return;
    const now = this.ctx.currentTime;
    const freqMap: Record<string, { freq: number; gain: number }> = {
      'golden-gate-approach': { freq: 320, gain: 0.17 },
      'great-courtyard': { freq: 480, gain: 0.14 },
      'audience-hall': { freq: 180, gain: 0.08 },
      'palace-garden': { freq: 560, gain: 0.18 },
      'scholars-library': { freq: 210, gain: 0.07 },
      'market-street': { freq: 620, gain: 0.2 },
    };
    const cfg = (locationId && freqMap[locationId]) || { freq: 340, gain: 0.14 };
    this.bedFilter.frequency.setTargetAtTime(cfg.freq, now, 0.5);
    this.bedGain.gain.setTargetAtTime(cfg.gain, now, 0.5);
  }

  setDucking(ducked: boolean): void {
    this.ducked = ducked;
    this.music.setDucked(ducked);
    this.applyVolumes();
  }

  playQuizChime(kind: 'correct' | 'gentle' | 'complete'): void {
    this.music.playQuizChime(kind);
  }

  setVolumes(volumes: {
    environment: number;
    voices: number;
    people: number;
    music?: number;
    muted: boolean;
  }): void {
    this.volumes = {
      ...this.volumes,
      ...volumes,
      music: volumes.music ?? this.volumes.music,
    };
    this.music.setVolume(this.volumes.music);
    this.music.setEnabled(!this.volumes.muted && this.volumes.music > 0.01 && Boolean(this.ctx));
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.masterGain || !this.envGain || !this.voiceGain || !this.peopleGain) return;
    const now = this.ctx.currentTime;
    const duckFactor = this.ducked ? 0.38 : 1.0; // ~ -8 dB during speech
    this.masterGain.gain.setTargetAtTime(this.volumes.muted ? 0 : 1, now, 0.08);
    this.envGain.gain.setTargetAtTime(this.volumes.environment ** 2 * duckFactor, now, 0.25);
    this.voiceGain.gain.setTargetAtTime(this.volumes.voices ** 2, now, 0.08);
    this.peopleGain.gain.setTargetAtTime(this.volumes.people ** 2 * duckFactor, now, 0.25);
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.volumes.muted ? 0 : 1, now, 0.08);
    }
  }

  updateListener(x: number, y: number, z: number, yaw: number, dt: number, movedDist: number, surface: string): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const listener = this.ctx.listener;
    if (listener.positionX) {
      listener.positionX.value = x;
      listener.positionY.value = y;
      listener.positionZ.value = z;
      listener.forwardX.value = -Math.sin(yaw);
      listener.forwardY.value = 0;
      listener.forwardZ.value = -Math.cos(yaw);
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    }

    // Distance-triggered footsteps
    this.stepAccum += movedDist;
    if (this.stepAccum >= 0.78) {
      this.stepAccum = 0;
      this.playFootstep(surface);
    }

    // Occasional garden bird chirps (no music, pure natural bird sweep)
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = 3.5 + Math.random() * 5.0;
      if (this.currentLocationId === 'palace-garden' || this.currentLocationId === 'great-courtyard') {
        this.playBirdChirp();
      }
    }
  }

  private playFootstep(surface: string): void {
    if (!this.ctx || !this.noiseBuffer || !this.envGain) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.94 + Math.random() * 0.12;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value =
      surface === 'marble' ? 920 : surface === 'carpet' ? 210 : surface === 'grass' ? 1400 : 540;
    filter.Q.value = 1.6;

    const g = this.ctx.createGain();
    const peak = surface === 'carpet' ? 0.045 : 0.095;
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.envGain);
    src.start(now, Math.random() * 1.5, 0.1);
  }

  private playBirdChirp(): void {
    if (!this.ctx || !this.envGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const base = 2400 + Math.random() * 900;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.32, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(base * 0.92, now + 0.11);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.025, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(g);
    g.connect(this.envGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private clearEmitters(): void {
    for (const node of this.emitterNodes) {
      node.gain.disconnect();
      node.panner.disconnect();
    }
    this.emitterNodes = [];
  }

  dispose(): void {
    this.clearEmitters();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
