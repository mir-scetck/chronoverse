import { expect, test } from 'vitest';
import { CollisionWorld, PLAYER_RADIUS, type PlayerBody } from './CollisionWorld';

function makeBody(x = 0, y = 0, z = 0): PlayerBody {
  return { x, y, z, vx: 0, vy: 0, vz: 0, grounded: true };
}

test('blocked by a wall', () => {
  const cw = new CollisionWorld();
  cw.addCollider('wall', {
    shape: 'box',
    position: { x: 0, y: 0, z: -2 },
    size: { x: 10, y: 3, z: 0.6 },
  });
  const body = makeBody(0, 0, 0);
  body.vz = -4;
  for (let i = 0; i < 60; i += 1) cw.step(body, 1 / 60);
  expect(body.z).toBeGreaterThanOrEqual(-2 + 0.3 + PLAYER_RADIUS - 0.01);
});

test('slide along a wall cleanly', () => {
  const cw = new CollisionWorld();
  cw.addCollider('wall', {
    shape: 'box',
    position: { x: 0, y: 0, z: -2 },
    size: { x: 20, y: 3, z: 0.6 },
  });
  const body = makeBody(0, 0, -1.2);
  body.vx = 3;
  body.vz = -3;
  for (let i = 0; i < 30; i += 1) cw.step(body, 1 / 60);
  expect(body.x).toBeGreaterThan(1.0);
  expect(body.z).toBeGreaterThanOrEqual(-1.7 + PLAYER_RADIUS - 0.02);
});

test('corner collision prevents passing through two perpendicular walls', () => {
  const cw = new CollisionWorld();
  cw.addCollider('w1', { shape: 'box', position: { x: 0, y: 0, z: -2 }, size: { x: 6, y: 3, z: 0.5 } });
  cw.addCollider('w2', { shape: 'box', position: { x: 2, y: 0, z: 0 }, size: { x: 0.5, y: 3, z: 6 } });
  const body = makeBody(1, 0, -1);
  body.vx = 4;
  body.vz = -4;
  for (let i = 0; i < 60; i += 1) cw.step(body, 1 / 60);
  expect(body.x).toBeLessThanOrEqual(1.75 - PLAYER_RADIUS + 0.02);
  expect(body.z).toBeGreaterThanOrEqual(-1.75 + PLAYER_RADIUS - 0.02);
});

test('step up 0.3 m walkable platform succeeds', () => {
  const cw = new CollisionWorld();
  cw.addCollider('step', {
    shape: 'box',
    position: { x: 0, y: 0, z: -2 },
    size: { x: 4, y: 0.3, z: 2 },
    walkableTop: true,
  });
  const body = makeBody(0, 0, 0);
  body.vz = -3;
  for (let i = 0; i < 60; i += 1) cw.step(body, 1 / 60);
  expect(body.z).toBeLessThan(-1.5);
  expect(Math.abs(body.y - 0.3)).toBeLessThan(0.05);
});

test('blocked by 0.5 m step', () => {
  const cw = new CollisionWorld();
  cw.addCollider('high-step', {
    shape: 'box',
    position: { x: 0, y: 0, z: -2 },
    size: { x: 4, y: 0.5, z: 2 },
    walkableTop: true,
  });
  const body = makeBody(0, 0, 0);
  body.vz = -3;
  for (let i = 0; i < 60; i += 1) cw.step(body, 1 / 60);
  expect(body.z).toBeGreaterThanOrEqual(-1 + PLAYER_RADIUS - 0.02);
});

test('fall from 3 m and land on ground', () => {
  const cw = new CollisionWorld();
  const body = makeBody(0, 3, 0);
  body.grounded = false;
  for (let i = 0; i < 120; i += 1) cw.step(body, 1 / 60);
  expect(body.y).toBe(0);
  expect(body.grounded).toBe(true);
});

test('no tunneling through thin wall at high speed', () => {
  const cw = new CollisionWorld();
  cw.addCollider('thin', {
    shape: 'box',
    position: { x: 0, y: 0, z: -2 },
    size: { x: 10, y: 3, z: 0.1 },
  });
  const body = makeBody(0, 0, -1.0);
  body.vz = -40;
  cw.step(body, 0.1);
  expect(body.z).toBeGreaterThan(-2.0);
});

test('NPC cylinder blocks player', () => {
  const cw = new CollisionWorld();
  cw.addCollider('npc', { shape: 'cylinder', position: { x: 0, y: 0, z: -2 }, size: { x: 0.4, y: 1.7, z: 0 } }, true);
  const body = makeBody(0, 0, 0);
  body.vz = -3;
  for (let i = 0; i < 60; i += 1) cw.step(body, 1 / 60);
  expect(body.z).toBeGreaterThanOrEqual(-2 + 0.4 + PLAYER_RADIUS - 0.02);
});

test('bounds clamp and pushOut on teleport', () => {
  const cw = new CollisionWorld();
  cw.setBounds({ minX: -10, maxX: 10, minZ: -10, maxZ: 10 });
  cw.addCollider('pillar', { shape: 'cylinder', position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 4, z: 0 } });

  const body = makeBody(0.1, 0, 0);
  cw.pushOut(body);
  expect(Math.hypot(body.x, body.z)).toBeGreaterThanOrEqual(1 + PLAYER_RADIUS - 0.02);

  body.x = 25;
  cw.pushOut(body);
  expect(body.x).toBeLessThanOrEqual(10 - PLAYER_RADIUS + 0.001);
});
