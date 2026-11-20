import { expect, test } from 'vitest';
import { LocationTracker } from './LocationTracker';
import type { World } from '../../contracts';

const testWorld = {
  id: 'baghdad',
  locations: [
    { id: 'gate', center: { x: 0, y: 0, z: 20 }, radius: 10 },
    { id: 'court', center: { x: 0, y: 0, z: 5 }, radius: 10 },
  ],
  characters: [],
  objects: [],
} as unknown as World;

test('LocationTracker handles spawn inside location, hysteresis, overlap, and exit', () => {
  const tracker = new LocationTracker();

  const r1 = tracker.evaluate(testWorld, 0, 22);
  expect(r1.transition.entered?.id).toBe('gate');
  expect(r1.transition.exited).toBeNull();

  const r2 = tracker.evaluate(testWorld, 0, 30.5);
  expect(r2.snapshot.currentLocation?.id).toBe('gate');
  expect(r2.transition.exited).toBeNull();

  const r3 = tracker.evaluate(testWorld, 0, 31.5);
  expect(r3.snapshot.currentLocation).toBeNull();
  expect(r3.transition.exited?.id).toBe('gate');
  expect(r3.transition.entered).toBeNull();

  const r4 = tracker.evaluate(testWorld, 0, 6);
  expect(r4.snapshot.currentLocation?.id).toBe('court');
  expect(r4.transition.entered?.id).toBe('court');
});
