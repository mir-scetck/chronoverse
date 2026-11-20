import * as THREE from 'three';
import type { StoryScene, TimeOfDayVariant, World } from '../../contracts';
import { eventBus } from '../../services/eventBus';

function applyEase(t: number, ease: 'linear' | 'in-out'): number {
  const c = Math.max(0, Math.min(1, t));
  if (ease === 'linear') return c;
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

export class StoryDirector {
  private activeStory: StoryScene | null = null;
  private world: World | null = null;
  private elapsed = 0;
  private lastSubtitleIndex = -2;
  private previousTimeOfDay: TimeOfDayVariant = 'day';
  private onApplyTimeOfDay: (v: TimeOfDayVariant) => void;
  private onCompleteCallback?: () => void;

  private camPos = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();

  constructor(onApplyTimeOfDay: (v: TimeOfDayVariant) => void) {
    this.onApplyTimeOfDay = onApplyTimeOfDay;
  }

  isPlaying(): boolean {
    return this.activeStory !== null;
  }

  getActiveStory(): StoryScene | null {
    return this.activeStory;
  }

  play(
    world: World,
    storyId: string,
    currentTimeOfDay: TimeOfDayVariant,
    onComplete?: () => void,
  ): boolean {
    const story = world.stories.find((s) => s.id === storyId);
    if (!story) return false;

    this.world = world;
    this.activeStory = story;
    this.elapsed = 0;
    this.lastSubtitleIndex = -2;
    this.previousTimeOfDay = currentTimeOfDay;
    this.onCompleteCallback = onComplete;

    if (story.timeOfDay) {
      this.onApplyTimeOfDay(story.timeOfDay);
    }

    eventBus.emit('story:start', { storyId: story.id, worldId: world.id });
    eventBus.emit('story:subtitle', { text: null, progress: 0 });
    return true;
  }

  skip(): void {
    if (!this.activeStory || !this.world) return;
    const watchedPercent = Math.round(
      Math.min(100, (this.elapsed / Math.max(0.1, this.activeStory.duration)) * 100),
    );
    this.finish(watchedPercent);
  }

  update(dt: number, camera: THREE.PerspectiveCamera): void {
    if (!this.activeStory || !this.world) return;

    this.elapsed += dt;
    const progress = Math.min(1, this.elapsed / Math.max(0.1, this.activeStory.duration));

    // Find current shot
    let shot = this.activeStory.shots[this.activeStory.shots.length - 1];
    for (const s of this.activeStory.shots) {
      if (this.elapsed >= s.start && this.elapsed <= s.start + s.duration) {
        shot = s;
        break;
      }
    }

    if (shot) {
      const localT = applyEase(
        (this.elapsed - shot.start) / Math.max(0.1, shot.duration),
        shot.ease,
      );
      this.camPos.set(
        THREE.MathUtils.lerp(shot.from.x, shot.to.x, localT),
        THREE.MathUtils.lerp(shot.from.y, shot.to.y, localT),
        THREE.MathUtils.lerp(shot.from.z, shot.to.z, localT),
      );
      this.lookTarget.set(
        THREE.MathUtils.lerp(shot.lookAtFrom.x, shot.lookAtTo.x, localT),
        THREE.MathUtils.lerp(shot.lookAtFrom.y, shot.lookAtTo.y, localT),
        THREE.MathUtils.lerp(shot.lookAtFrom.z, shot.lookAtTo.z, localT),
      );

      camera.position.copy(this.camPos);
      camera.lookAt(this.lookTarget);
      if (shot.fov && Math.abs(camera.fov - shot.fov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, shot.fov, 1 - Math.exp(-4 * dt));
        camera.updateProjectionMatrix();
      }
    }

    // Update subtitle cue
    let subIdx = -1;
    let subText = null;
    for (let i = 0; i < this.activeStory.subtitles.length; i += 1) {
      const cue = this.activeStory.subtitles[i];
      if (this.elapsed >= cue.start && this.elapsed <= cue.end) {
        subIdx = i;
        subText = cue.text;
        break;
      }
    }

    if (subIdx !== this.lastSubtitleIndex) {
      this.lastSubtitleIndex = subIdx;
      eventBus.emit('story:subtitle', { text: subText, progress });
    } else {
      eventBus.emit('story:subtitle', { text: subText, progress });
    }

    if (this.elapsed >= this.activeStory.duration) {
      this.finish(100);
    }
  }

  private finish(watchedPercent: number): void {
    if (!this.activeStory || !this.world) return;
    const endedId = this.activeStory.id;
    const worldId = this.world.id;
    this.activeStory = null;
    this.onApplyTimeOfDay(this.previousTimeOfDay);
    eventBus.emit('story:subtitle', { text: null, progress: 1 });
    eventBus.emit('story:end', { storyId: endedId, worldId, watchedPercent });
    this.onCompleteCallback?.();
  }
}
