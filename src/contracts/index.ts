export type WorldId = 'baghdad' | 'kingston' | 'granada' | 'samarkand';
export type WorldStatus = 'planned' | 'in-progress' | 'ready';
export type FactTag = 'documented' | 'traditional' | 'dramatized' | 'uncertain';
export type PortrayalKind = 'historical-figure' | 'fictional' | 'living-person';
export type LocationKind =
  | 'street'
  | 'palace'
  | 'garden'
  | 'library'
  | 'market'
  | 'school'
  | 'house'
  | 'workshop'
  | 'fortress'
  | 'observatory';
export type InteractionKind = 'inspect' | 'read' | 'use' | 'pickup' | 'talk' | 'teleport' | 'custom';
export type GestureName =
  | 'none'
  | 'greet'
  | 'explain'
  | 'emphasize'
  | 'think'
  | 'welcome'
  | 'point'
  | 'bow'
  | 'sad-sigh';
export type EmotionName =
  | 'neutral'
  | 'warm'
  | 'stern'
  | 'thoughtful'
  | 'amused'
  | 'sad'
  | 'excited';
export type QualityTier = 'auto' | 'high' | 'low';
export type TimeOfDayVariant = 'day' | 'dusk';

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
}

export interface SpawnPoint {
  position: Vec3;
  rotation: Euler;
}

export interface WorldLighting {
  sunDirection: Vec3;
  sunColor: string;
  sunIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  dusk?: {
    sunDirection: Vec3;
    sunColor: string;
    sunIntensity: number;
    skyTop: string;
    skyBottom: string;
    fogColor: string;
    fogNear: number;
    fogFar: number;
    lanternIntensity: number;
  };
}

export interface WorldTheme {
  accent: string;
  skyTop: string;
  skyBottom: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  lighting?: WorldLighting;
}

export interface MaterialRef {
  preset:
    | 'sandstone'
    | 'limestone'
    | 'brick'
    | 'plaster'
    | 'timber'
    | 'marble'
    | 'blue-tile'
    | 'geometric-tile'
    | 'carpet'
    | 'water'
    | 'grass'
    | 'cobble'
    | 'dirt'
    | 'iron'
    | 'emerald-tile'
    | 'brass';
  tint?: string;
}

export interface ColliderSpec {
  id?: string;
  shape: 'box' | 'cylinder';
  position: Vec3; // center of base
  size: Vec3; // box: width, height, depth | cylinder: radius, height, 0
  yaw?: number;
  walkableTop?: boolean;
}

export interface PrefabInstance {
  id: string;
  prefab: string;
  position: Vec3;
  rotation?: Euler;
  params: Record<string, number | string | boolean>;
  material: MaterialRef;
  collide: boolean;
}

export interface ScatterSpec {
  id: string;
  prefab: string;
  count: number;
  area:
    | { center: Vec3; size: readonly [number, number] }
    | { path: Vec3[]; spread: number };
  seed: number;
  scale: readonly [number, number];
  collide: boolean;
}

export interface SceneSpec {
  version: 1;
  bounds: {
    min: readonly [number, number];
    max: readonly [number, number];
  };
  ground: {
    y: number;
    material: MaterialRef;
  };
  prefabs: PrefabInstance[];
  scatter: ScatterSpec[];
  extraColliders?: ColliderSpec[];
}

export interface AudioBedRef {
  id: string;
  locationId: string;
  kind: 'wind' | 'courtyard' | 'hall' | 'garden' | 'library' | 'market';
  volume: number;
}

export interface AudioEmitterRef {
  id: string;
  kind: 'fountain' | 'horses' | 'scribes' | 'crowd' | 'birds';
  position: Vec3;
  maxDistance: number;
  volume: number;
}

export interface MusicTrack {
  id: string;
  title: LocalizedText;
  locationId: string;
  src: string;
  scale: 'hijaz' | 'rast' | 'bayati' | 'nahawand';
  bpm: number;
}

export interface SoundscapeSpec {
  beds: AudioBedRef[];
  emitters: AudioEmitterRef[];
  captionByLocation: Record<string, LocalizedText>;
  musicTracks?: MusicTrack[];
}

export interface VideoChapter {
  time: number;
  label: LocalizedText;
}

export interface VideoTranscriptLine {
  start: number;
  end: number;
  text: LocalizedText;
}

export interface VideoClip {
  id: string;
  category: 'overview' | 'district' | 'artifact';
  title: LocalizedText;
  summary: LocalizedText;
  durationSec: number;
  src: string;
  posterSrc: string;
  vttEnSrc?: string;
  vttArSrc?: string;
  locationId?: string;
  artifactId?: string;
  accuracy: FactTag;
  chapters: VideoChapter[];
  transcript: VideoTranscriptLine[];
}

export interface StoryShot {
  start: number;
  duration: number;
  from: Vec3;
  to: Vec3;
  lookAtFrom: Vec3;
  lookAtTo: Vec3;
  fov?: number;
  ease: 'linear' | 'in-out';
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: LocalizedText;
}

export interface StoryScene {
  id: string;
  title: LocalizedText;
  tag: FactTag;
  locationId: string;
  characterId?: string;
  summary: LocalizedText;
  timeOfDay?: TimeOfDayVariant;
  duration: number;
  shots: StoryShot[];
  subtitles: SubtitleCue[];
  sourceNote?: string;
}

export interface Location {
  id: string;
  name: LocalizedText;
  kind: LocationKind;
  description: LocalizedText;
  center: Vec3;
  radius: number;
  surface: 'stone' | 'marble' | 'carpet' | 'grass' | 'dirt';
  cameraHint?: {
    position: Vec3;
    lookAt: Vec3;
  };
}

export type InteractionAction =
  | { type: 'inspect' }
  | { type: 'read' }
  | { type: 'dialogue'; characterId: string }
  | { type: 'teleport'; targetLocationId: string; targetWorldId?: WorldId }
  | { type: 'video'; videoId: string; storyId?: string }
  | { type: 'custom'; handler: string; payload?: Record<string, unknown> };

export interface InteractiveObject {
  id: string;
  name: LocalizedText;
  kind: InteractionKind;
  locationId: string;
  position: Vec3;
  rotation?: Euler;
  prefab: string;
  interactionRadius: number;
  prompt: LocalizedText;
  description: LocalizedText;
  factTag: FactTag;
  sourceNote: string;
  glossaryTerm?: {
    term: LocalizedText;
    definition: LocalizedText;
  };
  action: InteractionAction;
}

export interface VoiceProfile {
  lang: 'ar-SA' | 'ar-EG' | 'en-US';
  gender: 'male' | 'female';
  pitch: number;
  rate: number;
  pauseMs: number;
  preferredVoiceNames: string[];
}

export interface CharacterAppearance {
  robeColor: string;
  cloakColor: string;
  turbanColor: string;
  sashColor: string;
  skinTone: string;
  beardColor?: string;
  scale: number;
  seated?: boolean;
}

export interface Character {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  portrayal: PortrayalKind;
  portrayalNotice: LocalizedText;
  homeLocationId: string;
  placement: SpawnPoint;
  interactionRadius: number;
  prompt: LocalizedText;
  greetingArabic: string;
  greetingEnglish: string;
  suggestedQuestions: string[];
  voice: VoiceProfile;
  appearance: CharacterAppearance;
  storyIds: string[];
}

export interface AssetRef {
  id: string;
  kind: 'procedural-texture' | 'procedural-model' | 'procedural-audio' | 'procedural-music';
  licence: 'CC0-procedural';
  source: string;
}

export interface World {
  id: WorldId;
  name: LocalizedText;
  eraLabel: LocalizedText;
  year: number;
  tagline: LocalizedText;
  summary: LocalizedText;
  honestyNote: LocalizedText;
  status: WorldStatus;
  primaryCharacterId: string;
  spawn: SpawnPoint;
  theme: WorldTheme;
  locations: Location[];
  objects: InteractiveObject[];
  characters: Character[];
  stories: StoryScene[];
  soundscape: SoundscapeSpec;
  scene: SceneSpec;
  assets: AssetRef[];
}

export interface DialogueSegment {
  text: string;
  tag: FactTag;
  translation?: string;
}

export interface DialogueTurn {
  segments: DialogueSegment[];
  emotion: EmotionName;
  gesture: GestureName;
  storyId?: string;
  followUps: string[];
  refusal?: 'anachronism' | 'out-of-scope' | 'unsafe' | 'unknown';
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatRequest {
  worldId: WorldId;
  characterId: string;
  language: 'en' | 'ar';
  message: string;
  history: ChatHistoryItem[];
  context: {
    currentLocationId: string | null;
    nearbyObjectIds: string[];
    discoveredFactIds: string[];
    watchedStoryIds: string[];
  };
  includeTranslation: boolean;
}

export interface ChatResponse {
  turn: DialogueTurn;
  mode: 'gemini' | 'offline';
  discoveredFactIds?: string[];
}

export interface AIService {
  sendMessage(request: ChatRequest): Promise<ChatResponse>;
}

export interface VoiceService {
  speak(text: string, profile: VoiceProfile, characterId: string): Promise<void>;
  stopSpeaking(): void;
  isSupportedRecognition(): boolean;
  startRecognition(options: {
    lang: string;
    onInterim: (text: string) => void;
    onFinal: (text: string) => void;
    onError: (code: string) => void;
  }): void;
  stopRecognition(): void;
  getVoices(): SpeechSynthesisVoice[];
}

export interface FocusPayload {
  targetType: 'object' | 'character';
  targetId: string;
  prompt: LocalizedText;
  distance: number;
}

export interface InteractPayload {
  targetType: 'object' | 'character';
  targetId: string;
  kind: InteractionKind;
  action: InteractionAction;
}

export interface WorldEventMap {
  'world:ready': { worldId: WorldId };
  'world:error': { worldId: WorldId; message: LocalizedText };
  'world:progress': { worldId: WorldId; progress: number; stage: string };
  'location:enter': { worldId: WorldId; locationId: string; location: Location };
  'location:exit': { worldId: WorldId; locationId: string };
  'object:focus': FocusPayload | null;
  'object:interact': InteractPayload;
  'dialogue:start': { characterId: string };
  'dialogue:end': { characterId: string };
  'voice:speak:start': { characterId: string };
  'voice:speak:end': { characterId: string };
  'voice:lip-sync': { characterId: string; open: number };
  'story:start': { storyId: string; worldId: WorldId };
  'story:end': { storyId: string; worldId: WorldId; watchedPercent: number };
  'story:subtitle': { text: LocalizedText | null; progress: number };
  'media:video:start': { videoId: string; locationId?: string };
  'media:video:end': { videoId: string; watchedPercent: number };
  'audio:music:change': { trackId: string; title: LocalizedText; locationId: string };
  'audio:quiz:chime': { kind: 'correct' | 'gentle' | 'complete' };
  'player:pose': { x: number; y: number; z: number; yaw: number };
}

export interface WorldRenderer {
  mount(container: HTMLElement, world: World): Promise<void>;
  loadWorld(world: World): Promise<void>;
  teleportTo(locationId: string): void;
  setPaused(paused: boolean): void;
  setCharacterSpeaking(characterId: string, speaking: boolean): void;
  triggerGesture(characterId: string, gesture: GestureName): void;
  setQuality(quality: QualityTier): void;
  setTimeOfDay(variant: TimeOfDayVariant): void;
  setAudioVolumes(volumes: {
    environment: number;
    voices: number;
    people: number;
    music?: number;
    muted: boolean;
  }): void;
  setControlPrefs(prefs: {
    mouseSensitivity: number;
    invertY: boolean;
    headBob: boolean;
    reducedMotion: boolean;
  }): void;
  enterPhotoMode(): void;
  exitPhotoMode(): void;
  setPhotoFov(fov: number): void;
  capturePhoto(caption?: string): string | null;
  playStory(storyId: string): void;
  skipStory(): void;
  unlockAudio(): void;
  requestPointerLock(): void;
  unmount(): void;
}
