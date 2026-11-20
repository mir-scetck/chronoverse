import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type {
  FocusPayload,
  GestureName,
  QualityTier,
  TimeOfDayVariant,
  World,
  WorldRenderer,
} from '../../contracts';
import { eventBus } from '../../services/eventBus';
import { AudioEngine } from '../audio/AudioEngine';
import { InputManager } from '../controls/InputManager';
import { TouchOverlay } from '../controls/TouchOverlay';
import { LocationTracker, makeLocationEvents } from '../nearby/LocationTracker';
import {
  CollisionWorld,
  PLAYER_EYE_HEIGHT,
  type PlayerBody,
} from '../physics/CollisionWorld';
import { buildWorldScene, type BuiltWorldScene } from '../scene/SceneBuilder';
import { StoryDirector } from '../story/StoryDirector';
import { MaterialLibrary } from '../textures/proceduralTextures';
import { ResourceTracker } from './ResourceTracker';

type LifecycleState = 'idle' | 'mounting' | 'loading' | 'ready' | 'paused' | 'disposed';

const activeRenderers = new WeakMap<HTMLElement, WorldRendererImpl>();

function detectSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const baseRenderer = String(gl.getParameter(gl.RENDERER) ?? '').toLowerCase();
    if (
      baseRenderer.includes('swiftshader') ||
      baseRenderer.includes('llvmpipe') ||
      baseRenderer.includes('software')
    ) {
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase();
      if (
        renderer.includes('swiftshader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('software')
      ) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export class WorldRendererImpl implements WorldRenderer {
  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(60, 1, 0.1, 360);
  private tracker = new ResourceTracker();
  private mats = new MaterialLibrary(this.tracker, 4);
  private collisions = new CollisionWorld();
  private locations = new LocationTracker();
  private audio = new AudioEngine();
  private input: InputManager | null = null;
  private touchOverlay: TouchOverlay | null = null;
  private fadeOverlay: HTMLDivElement | null = null;

  private built: BuiltWorldScene | null = null;
  private world: World | null = null;
  private envTarget: THREE.WebGLRenderTarget | null = null;
  private composer: EffectComposer | null = null;

  private state: LifecycleState = 'idle';
  private isSoftwareGl = false;
  private quality: QualityTier = 'auto';
  private timeOfDay: TimeOfDayVariant = 'day';
  private paused = false;
  private photoMode = false;
  private videoModalOpen = false;
  private activeDialogueCharId: string | null = null;

  private playerBody: PlayerBody = {
    x: 0,
    y: 0,
    z: 68,
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
  };
  private yaw = 0;
  private pitch = 0;
  private walkBobPhase = 0;
  private prevX = 0;
  private prevZ = 0;

  private photoOrbitYaw = 0;
  private photoOrbitPitch = 0.2;
  private photoOrbitDist = 4.2;

  private controlPrefs = {
    mouseSensitivity: 1.0,
    invertY: false,
    headBob: true,
    reducedMotion: false,
  };

  private storyDirector = new StoryDirector((variant) => {
    this.built?.applyTimeOfDay(variant);
  });

  private raycaster = new THREE.Raycaster();
  private rayTimer = 0;
  private locTimer = 0;
  private poseTimer = 0;
  private currentFocus: FocusPayload | null = null;

  private rafId: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private totalElapsed = 0;
  private unsubLipSync: (() => void) | null = null;
  private unsubMedia: Array<() => void> = [];

  private resizeObserver: ResizeObserver | null = null;

  async mount(container: HTMLElement, world: World): Promise<void> {
    // Prevent duplicate canvas in StrictMode
    const existing = activeRenderers.get(container);
    if (existing && existing !== this) {
      existing.unmount();
    }
    activeRenderers.set(container, this);

    this.state = 'mounting';
    this.container = container;
    container.innerHTML = '';

    let canvas: HTMLCanvasElement;
    try {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none;';
      canvas.setAttribute('data-testid', 'world-canvas');
      container.appendChild(canvas);

      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      this.state = 'disposed';
      eventBus.emit('world:error', {
        worldId: world.id,
        message: {
          en: 'WebGL rendering is unavailable in this browser.',
          ar: 'يتطلب العرض ثلاثي الأبعاد تفعيل WebGL في المتصفح.',
        },
      });
      return;
    }

    const gl = this.renderer.getContext();
    this.isSoftwareGl = detectSoftwareGl(gl);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isSoftwareGl ? 1 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Subtle procedural environment reflections for hardware GPUs (skip on software GL)
    if (!this.isSoftwareGl) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const roomEnv = new RoomEnvironment();
        this.envTarget = pmrem.fromScene(roomEnv, 0.04);
        this.scene.environment = this.envTarget.texture;
        this.scene.environmentIntensity = 0.35;
        roomEnv.dispose();
        pmrem.dispose();
      } catch {
        // Fallback safely if PMREM extension unavailable
      }
    }

    // Fade curtain overlay for smooth teleports
    const fade = document.createElement('div');
    fade.style.cssText =
      'position:absolute;inset:0;background:#0b0b0d;opacity:0;pointer-events:none;transition:opacity 220ms ease;z-index:15;';
    container.appendChild(fade);
    this.fadeOverlay = fade;

    // Resize handling
    this.handleResize();
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // WebGL context loss/restoration handlers
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);

    // Raycaster checks Layer 1 invisible pick volumes
    this.raycaster.layers.set(1);

    // Input & Touch controls
    this.input = new InputManager(canvas, {
      onInteract: () => this.triggerInteract(),
      onPauseToggle: () => {
        if (this.storyDirector.isPlaying()) {
          this.storyDirector.skip();
        } else if (this.photoMode) {
          this.exitPhotoMode();
        }
      },
    });
    this.touchOverlay = new TouchOverlay(container, this.input, () => this.triggerInteract());

    // Subscribe to voice lip-sync, video freeze/ducking, and quiz chime events
    this.unsubLipSync = eventBus.on('voice:lip-sync', ({ characterId, open }) => {
      const actor = this.built?.characters.get(characterId);
      actor?.pushLipSync(open);
    });

    this.unsubMedia = [
      eventBus.on('media:video:start', () => {
        this.videoModalOpen = true;
        this.audio.setDucking(true);
        this.input?.setBlocked(true);
      }),
      eventBus.on('media:video:end', () => {
        this.videoModalOpen = false;
        this.audio.setDucking(false);
        this.input?.setBlocked(this.paused || this.activeDialogueCharId !== null);
      }),
      eventBus.on('audio:quiz:chime', ({ kind }) => {
        this.audio.playQuizChime(kind);
      }),
    ];

    this.setupComposer();
    await this.loadWorld(world);
    if (this.renderer && this.built) {
      this.renderer.render(this.scene, this.camera);
    }
    this.startLoop();
  }

  private setupComposer(): void {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    // Strict GPU-only post-processing guard (never run multi-pass bloom on SwiftShader software GL)
    if (!this.renderer || this.isSoftwareGl || this.quality !== 'high') return;
    const width = Math.max(1, this.container?.clientWidth ?? 1280);
    const height = Math.max(1, this.container?.clientHeight ?? 720);
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(width, height), 0.22, 0.45, 0.88),
    );
    composer.addPass(new OutputPass());
    this.composer = composer;
  }

  async loadWorld(world: World): Promise<void> {
    if (this.state === 'disposed') return;
    this.state = 'loading';
    this.world = world;
    eventBus.emit('world:progress', { worldId: world.id, progress: 25, stage: 'materials' });

    if (this.built) {
      this.scene.remove(this.built.root);
      this.built = null;
      this.tracker.disposeAll();
      const maxAniso = this.renderer
        ? this.isSoftwareGl
          ? 1
          : Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
        : 4;
      this.mats = new MaterialLibrary(this.tracker, maxAniso);
    }

    eventBus.emit('world:progress', { worldId: world.id, progress: 65, stage: 'architecture' });
    this.built = buildWorldScene(
      world,
      this.scene,
      this.mats,
      this.tracker,
      this.collisions,
      this.isSoftwareGl,
      this.quality,
    );
    this.built.applyTimeOfDay(this.timeOfDay);

    // Position player at spawn
    this.playerBody = {
      x: world.spawn.position.x,
      y: world.spawn.position.y,
      z: world.spawn.position.z,
      vx: 0,
      vy: 0,
      vz: 0,
      grounded: true,
    };
    this.yaw = world.spawn.rotation.y;
    this.pitch = world.spawn.rotation.x;
    this.prevX = this.playerBody.x;
    this.prevZ = this.playerBody.z;
    this.collisions.pushOut(this.playerBody);
    this.syncCamera();

    // Evaluate starting location
    this.locations.reset();
    const { transition } = this.locations.evaluate(world, this.playerBody.x, this.playerBody.z, {
      forceReset: true,
    });
    for (const ev of makeLocationEvents(world.id, transition)) {
      if (ev.type === 'location:enter' && ev.location) {
        eventBus.emit('location:enter', {
          worldId: world.id,
          locationId: ev.locationId,
          location: ev.location,
        });
        this.audio.setLocation(ev.locationId);
      }
    }

    this.audio.setupWorld(world);
    this.state = 'ready';
    eventBus.emit('world:progress', { worldId: world.id, progress: 100, stage: 'ready' });
    eventBus.emit('world:ready', { worldId: world.id });
  }

  teleportTo(locationId: string): void {
    if (!this.world) return;
    const loc = this.world.locations.find((l) => l.id === locationId);
    if (!loc) return;

    const doMove = () => {
      if (!this.world) return;
      const targetPos = loc.cameraHint ? loc.cameraHint.position : loc.center;
      this.playerBody.x = targetPos.x;
      this.playerBody.y = targetPos.y;
      this.playerBody.z = targetPos.z;
      this.playerBody.vx = 0;
      this.playerBody.vy = 0;
      this.playerBody.vz = 0;

      if (loc.cameraHint) {
        const dx = loc.cameraHint.lookAt.x - targetPos.x;
        const dz = loc.cameraHint.lookAt.z - targetPos.z;
        this.yaw = Math.atan2(-dx, -dz);
        this.pitch = 0;
      }

      this.collisions.pushOut(this.playerBody);
      this.prevX = this.playerBody.x;
      this.prevZ = this.playerBody.z;
      this.syncCamera();
      this.camera.updateMatrixWorld(true);
      this.evaluateFocus();

      const { transition } = this.locations.evaluate(
        this.world,
        this.playerBody.x,
        this.playerBody.z,
        { forceReset: true },
      );
      for (const ev of makeLocationEvents(this.world.id, transition)) {
        if (ev.type === 'location:exit') {
          eventBus.emit('location:exit', { worldId: this.world.id, locationId: ev.locationId });
        } else if (ev.type === 'location:enter' && ev.location) {
          eventBus.emit('location:enter', {
            worldId: this.world.id,
            locationId: ev.locationId,
            location: ev.location,
          });
          this.audio.setLocation(ev.locationId);
        }
      }

      eventBus.emit('player:pose', {
        x: this.playerBody.x,
        y: this.playerBody.y,
        z: this.playerBody.z,
        yaw: this.yaw,
      });
    };

    if (this.fadeOverlay && !this.controlPrefs.reducedMotion) {
      this.fadeOverlay.style.opacity = '1';
      setTimeout(() => {
        doMove();
        if (this.fadeOverlay) this.fadeOverlay.style.opacity = '0';
      }, 200);
    } else {
      doMove();
    }
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.input?.setBlocked(paused || this.activeDialogueCharId !== null);
    this.touchOverlay?.setVisible(!paused && this.activeDialogueCharId === null && !this.photoMode);
    if (paused) {
      this.audio.suspend();
      if (this.state === 'ready') this.state = 'paused';
    } else {
      this.audio.resume();
      if (this.state === 'paused') this.state = 'ready';
    }
  }

  setDialogueCharacter(characterId: string | null): void {
    if (this.activeDialogueCharId && this.activeDialogueCharId !== characterId) {
      const prevActor = this.built?.characters.get(this.activeDialogueCharId);
      prevActor?.endDialogue();
      prevActor?.setSpeaking(false);
    }
    this.activeDialogueCharId = characterId;
    if (characterId) {
      const actor = this.built?.characters.get(characterId);
      actor?.startDialogue(new THREE.Vector3(this.playerBody.x, this.playerBody.y, this.playerBody.z));
      this.input?.setBlocked(true);
      this.touchOverlay?.setVisible(false);
    } else {
      this.input?.setBlocked(this.paused);
      this.touchOverlay?.setVisible(!this.paused && !this.photoMode);
    }
  }

  setCharacterSpeaking(characterId: string, speaking: boolean): void {
    const actor = this.built?.characters.get(characterId);
    actor?.setSpeaking(speaking);
    this.audio.setDucking(speaking);
  }

  triggerGesture(characterId: string, gesture: GestureName): void {
    const actor = this.built?.characters.get(characterId);
    actor?.playGesture(gesture);
  }

  setQuality(quality: QualityTier): void {
    this.quality = quality;
    if (!this.renderer || !this.built) return;
    const allowShadow = !this.isSoftwareGl && quality !== 'low';
    this.renderer.shadowMap.enabled = allowShadow;
    this.built.sunLight.castShadow = allowShadow;
    const pr = quality === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, this.isSoftwareGl ? 1 : 2);
    this.renderer.setPixelRatio(pr);
    this.setupComposer();
  }

  setTimeOfDay(variant: TimeOfDayVariant): void {
    this.timeOfDay = variant;
    if (!this.storyDirector.isPlaying()) {
      this.built?.applyTimeOfDay(variant);
    }
  }

  setAudioVolumes(volumes: {
    environment: number;
    voices: number;
    people: number;
    music?: number;
    muted: boolean;
  }): void {
    this.audio.setVolumes(volumes);
  }

  setControlPrefs(prefs: {
    mouseSensitivity: number;
    invertY: boolean;
    headBob: boolean;
    reducedMotion: boolean;
  }): void {
    this.controlPrefs = prefs;
    this.input?.setPreferences({
      mouseSensitivity: prefs.mouseSensitivity,
      invertY: prefs.invertY,
    });
  }

  enterPhotoMode(): void {
    this.photoMode = true;
    this.photoOrbitYaw = this.yaw;
    this.photoOrbitPitch = 0.25;
    this.photoOrbitDist = 4.2;
    this.input?.setBlocked(false);
    this.touchOverlay?.setVisible(false);
  }

  exitPhotoMode(): void {
    this.photoMode = false;
    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();
    this.syncCamera();
    this.touchOverlay?.setVisible(!this.paused && this.activeDialogueCharId === null);
  }

  setPhotoFov(fov: number): void {
    this.camera.fov = THREE.MathUtils.clamp(fov, 28, 88);
    this.camera.updateProjectionMatrix();
  }

  capturePhoto(caption?: string): string | null {
    if (!this.renderer) return null;
    this.renderer.render(this.scene, this.camera);
    const srcCanvas = this.renderer.domElement;

    const out = document.createElement('canvas');
    out.width = srcCanvas.width;
    out.height = srcCanvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(srcCanvas, 0, 0);

    if (caption && caption.trim().length > 0) {
      const barH = Math.max(44, Math.round(out.height * 0.065));
      ctx.fillStyle = 'rgba(11, 11, 13, 0.82)';
      ctx.fillRect(0, out.height - barH, out.width, barH);
      ctx.fillStyle = '#c9a353';
      ctx.font = `600 ${Math.round(barH * 0.42)}px serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(caption.trim(), 24, out.height - barH * 0.5);
    }

    return out.toDataURL('image/png');
  }

  playStory(storyId: string): void {
    if (!this.world) return;
    this.input?.setBlocked(true);
    this.touchOverlay?.setVisible(false);
    this.storyDirector.play(this.world, storyId, this.timeOfDay, () => {
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
      this.syncCamera();
      this.input?.setBlocked(this.paused || this.activeDialogueCharId !== null);
      this.touchOverlay?.setVisible(!this.paused && this.activeDialogueCharId === null);
    });
  }

  skipStory(): void {
    this.storyDirector.skip();
  }

  unlockAudio(): void {
    this.audio.unlock();
    if (this.world) {
      this.audio.setupWorld(this.world);
      const loc = this.locations.getCurrentLocation();
      this.audio.setLocation(loc?.id ?? null);
    }
  }

  requestPointerLock(): void {
    this.input?.requestPointerLock();
  }

  private triggerInteract(): void {
    if (!this.world || this.paused || this.photoMode || this.storyDirector.isPlaying()) return;
    if (!this.currentFocus) return;

    if (this.currentFocus.targetType === 'object') {
      const obj = this.world.objects.find((o) => o.id === this.currentFocus?.targetId);
      if (!obj) return;
      eventBus.emit('object:interact', {
        targetType: 'object',
        targetId: obj.id,
        kind: obj.kind,
        action: obj.action,
      });
    } else {
      const ch = this.world.characters.find((c) => c.id === this.currentFocus?.targetId);
      if (!ch) return;
      eventBus.emit('object:interact', {
        targetType: 'character',
        targetId: ch.id,
        kind: 'talk',
        action: { type: 'dialogue', characterId: ch.id },
      });
    }
  }

  private handleResize(): void {
    if (!this.container || !this.renderer) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
  }

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    this.stopLoop();
  };

  private handleContextRestored = (): void => {
    this.startLoop();
  };

  private startLoop(): void {
    if (this.rafId !== null || this.timeoutId !== null || this.state === 'disposed') return;
    this.lastTime = performance.now();

    const tick = () => {
      this.rafId = null;
      if (this.state === 'disposed') return;
      const now = performance.now();
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.1);

      this.stepSimulation(dt);
      if (this.composer && !this.isSoftwareGl && this.quality === 'high') {
        this.composer.render();
      } else if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }

      if (this.isSoftwareGl) {
        // Yield to Chromium compositor so software WebGL renders smoothly without stalling screenshots
        this.timeoutId = setTimeout(() => {
          this.timeoutId = null;
          if (this.state !== 'disposed') {
            this.rafId = requestAnimationFrame(tick);
          }
        }, 32);
      } else {
        this.rafId = requestAnimationFrame(tick);
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private stepSimulation(dt: number): void {
    if (!this.world || !this.built) return;
    this.totalElapsed += dt;

    if (this.storyDirector.isPlaying()) {
      this.storyDirector.update(dt, this.camera);
      this.built.update(dt, this.totalElapsed, this.camera.position);
      return;
    }

    if (this.photoMode) {
      if (this.input) {
        const { yawDelta, pitchDelta } = this.input.consumeLookDelta();
        this.photoOrbitYaw += yawDelta;
        this.photoOrbitPitch = THREE.MathUtils.clamp(
          this.photoOrbitPitch - pitchDelta,
          -0.25,
          1.15,
        );
        const intent = this.input.getMoveIntent();
        this.photoOrbitDist = THREE.MathUtils.clamp(
          this.photoOrbitDist - intent.forward * dt * 4.5,
          1.8,
          14,
        );
      }
      const focusX = this.playerBody.x;
      const focusY = this.playerBody.y + 1.45;
      const focusZ = this.playerBody.z;
      this.camera.position.set(
        focusX + Math.sin(this.photoOrbitYaw) * Math.cos(this.photoOrbitPitch) * this.photoOrbitDist,
        focusY + Math.sin(this.photoOrbitPitch) * this.photoOrbitDist,
        focusZ + Math.cos(this.photoOrbitYaw) * Math.cos(this.photoOrbitPitch) * this.photoOrbitDist,
      );
      this.camera.lookAt(focusX, focusY, focusZ);
      this.built.update(dt, this.totalElapsed, this.camera.position);
      return;
    }

    if (this.paused) {
      this.built.update(dt * 0.15, this.totalElapsed, this.camera.position);
      return;
    }

    // Look rotation (blocked during dialogue or video modal)
    if (this.input && !this.activeDialogueCharId && !this.videoModalOpen) {
      const { yawDelta, pitchDelta } = this.input.consumeLookDelta();
      this.yaw += yawDelta;
      this.pitch = THREE.MathUtils.clamp(this.pitch + pitchDelta, -1.32, 1.32);
    }

    // Fixed 60 Hz physics step
    const fixedDt = 1 / 60;
    this.accumulator += dt;
    while (this.accumulator >= fixedDt) {
      if (this.input && !this.activeDialogueCharId && !this.videoModalOpen) {
        const intent = this.input.getMoveIntent();
        const speed = intent.sprint ? 7.2 : 4.2;
        const sinY = Math.sin(this.yaw);
        const cosY = Math.cos(this.yaw);

        const forwardX = -sinY;
        const forwardZ = -cosY;
        const rightX = cosY;
        const rightZ = -sinY;

        this.playerBody.vx = (forwardX * intent.forward + rightX * intent.strafe) * speed;
        this.playerBody.vz = (forwardZ * intent.forward + rightZ * intent.strafe) * speed;
      } else {
        this.playerBody.vx = 0;
        this.playerBody.vz = 0;
      }

      this.collisions.step(this.playerBody, fixedDt);
      this.accumulator -= fixedDt;
    }

    const movedDist = Math.hypot(
      this.playerBody.x - this.prevX,
      this.playerBody.z - this.prevZ,
    );
    this.prevX = this.playerBody.x;
    this.prevZ = this.playerBody.z;

    if (movedDist > 0.002 && this.controlPrefs.headBob && !this.controlPrefs.reducedMotion) {
      this.walkBobPhase += movedDist * 3.1;
    }

    this.syncCamera();

    // Update animated world actors & background walkers
    this.built.update(
      dt,
      this.totalElapsed,
      new THREE.Vector3(this.playerBody.x, this.playerBody.y, this.playerBody.z),
    );

    // Location & nearby tracker at 5 Hz
    this.locTimer += dt;
    if (this.locTimer >= 0.2) {
      this.locTimer = 0;
      const { transition } = this.locations.evaluate(
        this.world,
        this.playerBody.x,
        this.playerBody.z,
      );
      for (const ev of makeLocationEvents(this.world.id, transition)) {
        if (ev.type === 'location:exit') {
          eventBus.emit('location:exit', { worldId: this.world.id, locationId: ev.locationId });
        } else if (ev.type === 'location:enter' && ev.location) {
          eventBus.emit('location:enter', {
            worldId: this.world.id,
            locationId: ev.locationId,
            location: ev.location,
          });
          this.audio.setLocation(ev.locationId);
        }
      }
    }

    // Audio listener & surface footsteps
    const currentSurface = this.locations.getCurrentLocation()?.surface ?? 'stone';
    this.audio.updateListener(
      this.playerBody.x,
      this.playerBody.y + PLAYER_EYE_HEIGHT,
      this.playerBody.z,
      this.yaw,
      dt,
      movedDist,
      currentSurface,
    );

    // Emit player pose at ~15 Hz for minimap
    this.poseTimer += dt;
    if (this.poseTimer >= 0.066) {
      this.poseTimer = 0;
      eventBus.emit('player:pose', {
        x: this.playerBody.x,
        y: this.playerBody.y,
        z: this.playerBody.z,
        yaw: this.yaw,
      });
    }

    // Focus raycast at ~15 Hz (also check proximity fallback for nearby characters/objects)
    this.rayTimer += dt;
    if (this.rayTimer >= 0.066) {
      this.rayTimer = 0;
      this.evaluateFocus();
    }
  }

  private evaluateFocus(): void {
    if (!this.built || !this.world || this.activeDialogueCharId) {
      if (this.currentFocus !== null) {
        this.currentFocus = null;
        eventBus.emit('object:focus', null);
        this.touchOverlay?.setInteractTarget(null);
      }
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.built.pickTargets, false);

    let nextFocus: FocusPayload | null = null;
    for (const hit of hits) {
      const data = hit.object.userData as {
        targetType?: 'object' | 'character';
        targetId?: string;
        prompt?: { en: string; ar: string };
        interactionRadius?: number;
      };
      if (!data.targetId || !data.targetType || !data.prompt) continue;
      const maxDist = data.interactionRadius ?? 3.6;
      if (hit.distance <= maxDist) {
        nextFocus = {
          targetType: data.targetType,
          targetId: data.targetId,
          prompt: data.prompt,
          distance: hit.distance,
        };
        break;
      }
    }

    // Subtle generous proximity fallback when looking right near an object within 2.4m
    if (!nextFocus) {
      const forwardX = -Math.sin(this.yaw);
      const forwardZ = -Math.cos(this.yaw);
      let bestScore = Infinity;

      for (const ch of this.world.characters) {
        const dx = ch.placement.position.x - this.playerBody.x;
        const dz = ch.placement.position.z - this.playerBody.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= ch.interactionRadius * 0.9) {
          const dot = (dx * forwardX + dz * forwardZ) / Math.max(0.01, dist);
          if (dot > 0.65 && dist < bestScore) {
            bestScore = dist;
            nextFocus = {
              targetType: 'character',
              targetId: ch.id,
              prompt: ch.prompt,
              distance: dist,
            };
          }
        }
      }

      if (!nextFocus) {
        for (const obj of this.world.objects) {
          const dx = obj.position.x - this.playerBody.x;
          const dz = obj.position.z - this.playerBody.z;
          const dist = Math.hypot(dx, dz);
          if (dist <= obj.interactionRadius * 0.85) {
            const dot = (dx * forwardX + dz * forwardZ) / Math.max(0.01, dist);
            if (dot > 0.62 && dist < bestScore) {
              bestScore = dist;
              nextFocus = {
                targetType: 'object',
                targetId: obj.id,
                prompt: obj.prompt,
                distance: dist,
              };
            }
          }
        }
      }
    }

    const changed =
      this.currentFocus?.targetId !== nextFocus?.targetId ||
      this.currentFocus?.targetType !== nextFocus?.targetType;
    if (changed) {
      this.currentFocus = nextFocus;
      eventBus.emit('object:focus', nextFocus);
      this.touchOverlay?.setInteractTarget(nextFocus ? nextFocus.prompt.en : null);
    }
  }

  private syncCamera(): void {
    const bobOffset =
      this.controlPrefs.headBob && !this.controlPrefs.reducedMotion
        ? Math.sin(this.walkBobPhase) * 0.032
        : 0;
    this.camera.position.set(
      this.playerBody.x,
      this.playerBody.y + PLAYER_EYE_HEIGHT + bobOffset,
      this.playerBody.z,
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }

  unmount(): void {
    if (this.state === 'disposed') return;
    this.state = 'disposed';
    this.stopLoop();

    this.unsubLipSync?.();
    this.unsubLipSync = null;
    for (const u of this.unsubMedia) u();
    this.unsubMedia = [];

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);
    }

    this.input?.dispose();
    this.input = null;
    this.touchOverlay?.dispose();
    this.touchOverlay = null;
    this.audio.dispose();

    this.composer?.dispose();
    this.composer = null;
    this.tracker.disposeAll();
    this.envTarget?.dispose();
    this.envTarget = null;
    this.renderer?.dispose();
    this.renderer = null;

    if (this.container) {
      this.container.innerHTML = '';
      activeRenderers.delete(this.container);
      this.container = null;
    }
  }
}
