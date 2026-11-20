import type { World, WorldId, Location } from '../contracts';

export interface WorldProgressData {
  discoveredLocations: string[];
  inspectedObjects: string[];
  primaryDialogueTurns: number;
  watchedStories: string[];
  discoveredFacts: Array<{ id: string; text: string; source: string }>;
  glossary: Array<{ id: string; termEn: string; termAr: string; defEn: string; defAr: string }>;
  conversationSnippets: Array<{ characterName: string; question: string; reply: string; timestamp: number }>;
}

export type AllProgressState = Record<WorldId, WorldProgressData>;

export function createEmptyWorldProgress(): WorldProgressData {
  return {
    discoveredLocations: [],
    inspectedObjects: [],
    primaryDialogueTurns: 0,
    watchedStories: [],
    discoveredFacts: [],
    glossary: [],
    conversationSnippets: [],
  };
}

export function calculateSealProgress(world: World, progress: WorldProgressData): {
  completed: number;
  total: number;
  percent: number;
  sealEarned: boolean;
} {
  const inspectableObjects = world.objects.filter(
    (obj) => obj.kind === 'inspect' || obj.kind === 'read',
  );
  const total =
    world.locations.length +
    inspectableObjects.length +
    1 + // >= 3 exchanges with primary character
    world.stories.length;

  const discoveredLocCount = world.locations.filter((l) =>
    progress.discoveredLocations.includes(l.id),
  ).length;
  const inspectedObjCount = inspectableObjects.filter((o) =>
    progress.inspectedObjects.includes(o.id),
  ).length;
  const dialogueTarget = progress.primaryDialogueTurns >= 3 ? 1 : 0;
  const storyCount = world.stories.filter((s) =>
    progress.watchedStories.includes(s.id),
  ).length;

  const completed = discoveredLocCount + inspectedObjCount + dialogueTarget + storyCount;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percent,
    sealEarned: completed >= total && total > 0,
  };
}

export function findNearestUndiscoveredLocation(
  world: World,
  discoveredLocations: string[],
  playerX: number,
  playerZ: number,
): Location | null {
  let nearest: Location | null = null;
  let bestDistSq = Infinity;

  for (const loc of world.locations) {
    if (discoveredLocations.includes(loc.id)) continue;
    const dx = loc.center.x - playerX;
    const dz = loc.center.z - playerZ;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      nearest = loc;
    }
  }
  return nearest;
}
