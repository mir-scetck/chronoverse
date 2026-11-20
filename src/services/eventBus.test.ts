import { expect, test } from 'vitest';
import { TypedEventBus } from './eventBus';

test('eventBus subscribes, emits, and unsubscribes cleanly', () => {
  const bus = new TypedEventBus();
  let count = 0;
  let lastWorldId = '';

  const unsub = bus.on('world:ready', (payload) => {
    count += 1;
    lastWorldId = payload.worldId;
  });

  bus.emit('world:ready', { worldId: 'baghdad' });
  expect(count).toBe(1);
  expect(lastWorldId).toBe('baghdad');

  unsub();
  bus.emit('world:ready', { worldId: 'baghdad' });
  expect(count).toBe(1);
});

test('eventBus once fires only a single time', () => {
  const bus = new TypedEventBus();
  let calls = 0;

  bus.once('dialogue:start', () => {
    calls += 1;
  });

  bus.emit('dialogue:start', { characterId: 'harun-al-rashid' });
  bus.emit('dialogue:start', { characterId: 'harun-al-rashid' });
  expect(calls).toBe(1);
});
