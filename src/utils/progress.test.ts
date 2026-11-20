import { expect, test } from 'vitest';
import {
  calculateSealProgress,
  createEmptyWorldProgress,
  findNearestUndiscoveredLocation,
} from './progress';
import type { World } from '../contracts';

const mockWorld = {
  id: 'baghdad',
  locations: [
    { id: 'loc-a', center: { x: 0, y: 0, z: 60 }, radius: 10 },
    { id: 'loc-b', center: { x: 0, y: 0, z: 10 }, radius: 10 },
  ],
  objects: [
    { id: 'obj-1', kind: 'inspect' },
    { id: 'obj-2', kind: 'read' },
    { id: 'obj-door', kind: 'teleport' },
  ],
  stories: [{ id: 'story-1' }],
} as unknown as World;

test('calculateSealProgress counts locations, inspect/read objects, primary dialogue >=3, and stories', () => {
  const progress = createEmptyWorldProgress();
  let result = calculateSealProgress(mockWorld, progress);
  expect(result.total).toBe(6);
  expect(result.completed).toBe(0);
  expect(result.sealEarned).toBe(false);

  progress.discoveredLocations = ['loc-a', 'loc-b'];
  progress.inspectedObjects = ['obj-1', 'obj-2'];
  progress.primaryDialogueTurns = 3;
  progress.watchedStories = ['story-1'];

  result = calculateSealProgress(mockWorld, progress);
  expect(result.completed).toBe(6);
  expect(result.percent).toBe(100);
  expect(result.sealEarned).toBe(true);
});

test('findNearestUndiscoveredLocation skips discovered locations and returns closest', () => {
  const nearest1 = findNearestUndiscoveredLocation(mockWorld, [], 0, 55);
  expect(nearest1?.id).toBe('loc-a');

  const nearest2 = findNearestUndiscoveredLocation(mockWorld, ['loc-a'], 0, 55);
  expect(nearest2?.id).toBe('loc-b');

  const nearest3 = findNearestUndiscoveredLocation(mockWorld, ['loc-a', 'loc-b'], 0, 55);
  expect(nearest3).toBeNull();
});
