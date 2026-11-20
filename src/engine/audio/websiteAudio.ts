import { BAGHDAD_WORLD } from '../../data/worlds/baghdad';
import { eventBus } from '../../services/eventBus';
import { MusicManager } from './MusicManager';

class WebsiteStudyAudioController {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private music = new MusicManager();
  private enabled = false;
  private threeActive = false;

  constructor() {
    eventBus.on('audio:quiz:chime', ({ kind }) => {
      if (!this.threeActive && this.enabled) {
        this.music.playQuizChime(kind);
      }
    });
    eventBus.on('media:video:start', () => {
      this.music.setDucked(true);
    });
    eventBus.on('media:video:end', () => {
      this.music.setDucked(false);
    });
  }

  setThreeActive(active: boolean): void {
    this.threeActive = active;
    if (active) {
      this.music.setEnabled(false);
    } else if (this.enabled) {
      this.ensureContext();
      this.music.setEnabled(true);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.threeActive) {
      this.music.setEnabled(false);
      return;
    }
    if (enabled) {
      this.ensureContext();
      this.music.setEnabled(true);
    } else {
      this.music.setEnabled(false);
    }
  }

  setDistrict(locationId: string): void {
    if (!this.threeActive && this.enabled) {
      void this.music.crossfadeToLocation(locationId);
    }
  }

  private ensureContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0.85;
      this.gain.connect(this.ctx.destination);
      this.music.attach(this.ctx, this.gain);
      this.music.setWorldTracks(BAGHDAD_WORLD);
      this.music.setVolume(0.5);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }
}

export const websiteStudyAudio = new WebsiteStudyAudioController();
