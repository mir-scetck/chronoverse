import * as THREE from 'three';
import type { ColliderSpec, MaterialRef, PrefabInstance } from '../../contracts';
import type { MaterialLibrary } from '../textures/proceduralTextures';
import type { ResourceTracker } from '../core/ResourceTracker';

export interface PrefabBuildResult {
  group: THREE.Group;
  colliders: ColliderSpec[];
  waterMeshes?: THREE.Mesh[];
  lanternLights?: THREE.Vector3[];
}

function setShadow(obj: THREE.Object3D, cast: boolean, receive: boolean): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

function addContactShadow(
  group: THREE.Group,
  radius: number,
  mats: MaterialLibrary,
  tracker: ResourceTracker,
): void {
  const geo = tracker.trackGeometry(new THREE.CircleGeometry(radius, 20));
  const disc = new THREE.Mesh(geo, mats.getContactShadowMaterial());
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.015;
  group.add(disc);
}

export function buildPrefab(
  spec: PrefabInstance,
  mats: MaterialLibrary,
  tracker: ResourceTracker,
): PrefabBuildResult {
  const group = new THREE.Group();
  group.name = spec.id;
  group.position.set(spec.position.x, spec.position.y, spec.position.z);
  if (spec.rotation) {
    group.rotation.set(spec.rotation.x, spec.rotation.y, spec.rotation.z);
  }

  const yaw = spec.rotation?.y ?? 0;
  const colliders: ColliderSpec[] = [];
  const waterMeshes: THREE.Mesh[] = [];
  const lanternLights: THREE.Vector3[] = [];

  const p = spec.params;
  const num = (k: string, fallback: number) => (typeof p[k] === 'number' ? (p[k] as number) : fallback);
  const str = (k: string, fallback: string) => (typeof p[k] === 'string' ? (p[k] as string) : fallback);

  switch (spec.prefab) {
    case 'floor': {
      const w = num('width', 10);
      const d = num('depth', 10);
      const t = num('thickness', 0.04);
      const repX = Math.max(1, Math.round(w / 4));
      const repZ = Math.max(1, Math.round(d / 4));
      const geo = tracker.trackGeometry(new THREE.BoxGeometry(w, t, d));
      const mesh = new THREE.Mesh(geo, mats.getMaterial(spec.material, repX, repZ));
      mesh.position.y = t * 0.5;
      mesh.receiveShadow = true;
      group.add(mesh);
      break;
    }

    case 'wall': {
      const w = num('width', 10);
      const h = num('height', 5);
      const d = num('depth', 1.2);
      const mainMat = mats.getMaterial(spec.material, Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 3)));
      const trimMat = mats.getMaterial({ preset: 'sandstone', tint: '#d4b37d' }, 2, 1);

      const baseGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, 0.45, d + 0.16));
      const base = new THREE.Mesh(baseGeo, trimMat);
      base.position.y = 0.225;
      group.add(base);

      const bodyGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, h - 0.45, d));
      const body = new THREE.Mesh(bodyGeo, mainMat);
      body.position.y = 0.45 + (h - 0.45) * 0.5;
      group.add(body);

      // Abbasid stepped crenellations (merlons) along top
      const merlonCount = Math.max(2, Math.floor(w / 1.8));
      const merlonGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.9, 0.75, d * 0.65));
      for (let i = 0; i < merlonCount; i += 1) {
        const mx = -w * 0.5 + 0.9 + (i * (w - 1.8)) / Math.max(1, merlonCount - 1);
        const merlon = new THREE.Mesh(merlonGeo, trimMat);
        merlon.position.set(mx, h + 0.375, 0);
        group.add(merlon);
      }

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'box',
          position: spec.position,
          size: { x: w, y: h, z: d },
          yaw,
        });
      }
      break;
    }

    case 'gate': {
      const w = num('width', 16);
      const h = num('height', 11);
      const d = num('depth', 4);
      const archW = num('archWidth', 6.4);
      const pierW = (w - archW) * 0.5;
      const wallMat = mats.getMaterial(spec.material, 2, 2);
      const brickMat = mats.getMaterial({ preset: 'brick', tint: '#c59761' }, 2, 2);
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);

      // Two flanking gate piers
      const pierGeo = tracker.trackGeometry(new THREE.BoxGeometry(pierW, h, d));
      const leftPier = new THREE.Mesh(pierGeo, wallMat);
      leftPier.position.set(-(archW * 0.5 + pierW * 0.5), h * 0.5, 0);
      group.add(leftPier);

      const rightPier = new THREE.Mesh(pierGeo, wallMat);
      rightPier.position.set(archW * 0.5 + pierW * 0.5, h * 0.5, 0);
      group.add(rightPier);

      // Flanking round bastions
      const towerGeo = tracker.trackGeometry(new THREE.CylinderGeometry(1.7, 1.9, h + 1.8, 16));
      const tL = new THREE.Mesh(towerGeo, brickMat);
      tL.position.set(-w * 0.5, (h + 1.8) * 0.5, d * 0.35);
      group.add(tL);

      const tR = new THREE.Mesh(towerGeo, brickMat);
      tR.position.set(w * 0.5, (h + 1.8) * 0.5, d * 0.35);
      group.add(tR);

      // Lintel & upper gallery spanning arch
      const lintelH = h - 6.2;
      const lintelGeo = tracker.trackGeometry(new THREE.BoxGeometry(archW + 0.6, lintelH, d));
      const lintel = new THREE.Mesh(lintelGeo, wallMat);
      lintel.position.set(0, 6.2 + lintelH * 0.5, 0);
      group.add(lintel);

      // Extruded pointed arch trim
      const archRimGeo = tracker.trackGeometry(new THREE.TorusGeometry(archW * 0.5, 0.35, 8, 24, Math.PI));
      const archFront = new THREE.Mesh(archRimGeo, brassMat);
      archFront.position.set(0, 3.0, d * 0.5);
      group.add(archFront);

      setShadow(group, true, true);
      if (spec.collide) {
        // Only the left and right piers collide — center archway is 100% open!
        colliders.push(
          {
            shape: 'box',
            position: { x: spec.position.x - (archW * 0.5 + pierW * 0.5), y: spec.position.y, z: spec.position.z },
            size: { x: pierW + 1.2, y: h, z: d },
            yaw,
          },
          {
            shape: 'box',
            position: { x: spec.position.x + (archW * 0.5 + pierW * 0.5), y: spec.position.y, z: spec.position.z },
            size: { x: pierW + 1.2, y: h, z: d },
            yaw,
          },
        );
      }
      break;
    }

    case 'column-row': {
      const count = num('count', 4);
      const spacing = num('spacing', 4.2);
      const height = num('height', 5.0);
      const colMat = mats.getMaterial(spec.material, 1, 2);
      const capMat = mats.getMaterial({ preset: 'sandstone', tint: '#d4b47e' }, 1, 1);

      const plinthGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.95, 0.35, 0.95));
      const shaftGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.36, height - 0.85, 14));
      const capGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.56, 0.34, 0.5, 8));

      const totalLen = (count - 1) * spacing;
      for (let i = 0; i < count; i += 1) {
        const lx = -totalLen * 0.5 + i * spacing;
        const plinth = new THREE.Mesh(plinthGeo, capMat);
        plinth.position.set(lx, 0.175, 0);
        group.add(plinth);

        const shaft = new THREE.Mesh(shaftGeo, colMat);
        shaft.position.set(lx, 0.35 + (height - 0.85) * 0.5, 0);
        group.add(shaft);

        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(lx, height - 0.25, 0);
        group.add(cap);

        if (spec.collide) {
          const cos = Math.cos(yaw);
          const sin = Math.sin(yaw);
          colliders.push({
            shape: 'cylinder',
            position: {
              x: spec.position.x + lx * cos,
              y: spec.position.y,
              z: spec.position.z - lx * sin,
            },
            size: { x: 0.45, y: height, z: 0 },
          });
        }
      }

      // Overhead arcade beam
      const beamGeo = tracker.trackGeometry(new THREE.BoxGeometry(totalLen + 1.2, 0.75, 0.85));
      const beam = new THREE.Mesh(beamGeo, capMat);
      beam.position.set(0, height + 0.375, 0);
      group.add(beam);

      setShadow(group, true, true);
      break;
    }

    case 'iwan': {
      const w = num('width', 15);
      const h = num('height', 10.5);
      const d = num('depth', 5.5);
      const archW = num('archWidth', 7.5);
      const pierW = (w - archW) * 0.5;
      const wallMat = mats.getMaterial(spec.material, 2, 2);
      const tileMat = mats.getMaterial({ preset: 'blue-tile' }, 2, 2);

      const pierGeo = tracker.trackGeometry(new THREE.BoxGeometry(pierW, h, d));
      const left = new THREE.Mesh(pierGeo, wallMat);
      left.position.set(-(archW * 0.5 + pierW * 0.5), h * 0.5, 0);
      group.add(left);

      const right = new THREE.Mesh(pierGeo, wallMat);
      right.position.set(archW * 0.5 + pierW * 0.5, h * 0.5, 0);
      group.add(right);

      // Vaulted top
      const topGeo = tracker.trackGeometry(new THREE.BoxGeometry(archW, h - 6.0, d));
      const top = new THREE.Mesh(topGeo, wallMat);
      top.position.set(0, 6.0 + (h - 6.0) * 0.5, 0);
      group.add(top);

      // Glazed blue tile pishtaq frame
      const frameGeo = tracker.trackGeometry(new THREE.BoxGeometry(w + 0.2, 0.7, 0.4));
      const frame = new THREE.Mesh(frameGeo, tileMat);
      frame.position.set(0, h - 0.5, d * 0.5 + 0.15);
      group.add(frame);

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push(
          {
            shape: 'box',
            position: { x: spec.position.x - (archW * 0.5 + pierW * 0.5), y: spec.position.y, z: spec.position.z },
            size: { x: pierW, y: h, z: d },
            yaw,
          },
          {
            shape: 'box',
            position: { x: spec.position.x + (archW * 0.5 + pierW * 0.5), y: spec.position.y, z: spec.position.z },
            size: { x: pierW, y: h, z: d },
            yaw,
          },
        );
      }
      break;
    }

    case 'dome': {
      const radius = num('radius', 8);
      const drumH = num('drumHeight', 5.5);
      const drumMat = mats.getMaterial({ preset: 'plaster', tint: '#dec7a0' }, 3, 1);
      const domeMat = mats.getMaterial(spec.material, 4, 2);
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);

      const drumGeo = tracker.trackGeometry(new THREE.CylinderGeometry(radius * 0.96, radius * 1.02, drumH, 16));
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.position.y = drumH * 0.5;
      group.add(drum);

      const domeGeo = tracker.trackGeometry(new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55));
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = drumH;
      dome.scale.set(1, 1.18, 1);
      group.add(dome);

      // Brass finial spire
      const spireGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.08, 0.2, 3.2, 10));
      const spire = new THREE.Mesh(spireGeo, brassMat);
      spire.position.y = drumH + radius * 1.18 + 1.5;
      group.add(spire);

      const orbGeo = tracker.trackGeometry(new THREE.SphereGeometry(0.38, 12, 10));
      const orb = new THREE.Mesh(orbGeo, brassMat);
      orb.position.y = drumH + radius * 1.18 + 1.2;
      group.add(orb);

      setShadow(group, true, true);
      break;
    }

    case 'fountain': {
      const marbleMat = mats.getMaterial({ preset: 'marble', tint: '#e6dcc8' }, 2, 1);
      const waterMat = mats.getMaterial({ preset: 'water' }, 2, 2);
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);

      // Octagonal basin rim & step
      const stepGeo = tracker.trackGeometry(new THREE.CylinderGeometry(3.5, 3.7, 0.25, 8));
      const step = new THREE.Mesh(stepGeo, marbleMat);
      step.position.y = 0.125;
      group.add(step);

      const basinGeo = tracker.trackGeometry(new THREE.CylinderGeometry(2.85, 2.95, 0.72, 8));
      const basin = new THREE.Mesh(basinGeo, marbleMat);
      basin.position.y = 0.25 + 0.36;
      group.add(basin);

      const waterGeo = tracker.trackGeometry(new THREE.CylinderGeometry(2.5, 2.5, 0.08, 16));
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.y = 0.85;
      group.add(water);
      waterMeshes.push(water);

      // Central tiered finial
      const pedGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.45, 1.5, 12));
      const ped = new THREE.Mesh(pedGeo, marbleMat);
      ped.position.y = 1.05;
      group.add(ped);

      const bowlGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.95, 0.35, 0.35, 14));
      const bowl = new THREE.Mesh(bowlGeo, brassMat);
      bowl.position.y = 1.85;
      group.add(bowl);

      const tipGeo = tracker.trackGeometry(new THREE.ConeGeometry(0.22, 0.55, 10));
      const tip = new THREE.Mesh(tipGeo, brassMat);
      tip.position.y = 2.25;
      group.add(tip);

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'cylinder',
          position: spec.position,
          size: { x: 3.15, y: 1.4, z: 0 },
        });
      }
      break;
    }

    case 'water-channel': {
      const w = num('width', 24);
      const d = num('depth', 2.2);
      const stoneMat = mats.getMaterial({ preset: 'limestone' }, 4, 1);
      const waterMat = mats.getMaterial({ preset: 'water' }, 4, 1);

      const curbGeo = tracker.trackGeometry(new THREE.BoxGeometry(w + 0.5, 0.22, d + 0.45));
      const curb = new THREE.Mesh(curbGeo, stoneMat);
      curb.position.y = 0.11;
      group.add(curb);

      const waterGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, 0.06, d - 0.15));
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.y = 0.21;
      group.add(water);
      waterMeshes.push(water);
      break;
    }

    case 'dais': {
      const w = num('width', 8);
      const h = num('height', 0.3);
      const d = num('depth', 6);
      const carpetMat = mats.getMaterial(spec.material, 2, 2);
      const rimMat = mats.getMaterial({ preset: 'marble', tint: '#dfd2ba' }, 2, 1);

      const baseGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, h, d));
      const base = new THREE.Mesh(baseGeo, rimMat);
      base.position.y = h * 0.5;
      group.add(base);

      const rugGeo = tracker.trackGeometry(new THREE.BoxGeometry(w - 0.6, 0.04, d - 0.6));
      const rug = new THREE.Mesh(rugGeo, carpetMat);
      rug.position.y = h + 0.02;
      group.add(rug);

      // Ceremonial bolsters & brass lamp stand
      const bolsterGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.22, 0.22, 1.3, 12));
      const b1 = new THREE.Mesh(bolsterGeo, carpetMat);
      b1.rotation.z = Math.PI * 0.5;
      b1.position.set(0, h + 0.22, -d * 0.25);
      group.add(b1);

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'box',
          position: spec.position,
          size: { x: w, y: h, z: d },
          yaw,
          walkableTop: true,
        });
      }
      break;
    }

    case 'bookshelf': {
      const w = num('width', 4.5);
      const h = num('height', 3.2);
      const d = num('depth', 0.7);
      const woodMat = mats.getMaterial(spec.material, 1, 2);
      const scrollMat = mats.getMaterial({ preset: 'plaster', tint: '#e7dac0' }, 1, 1);
      const leatherMat = mats.getMaterial({ preset: 'carpet', tint: '#6f291f' }, 1, 1);

      const frameGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, h, d));
      const frame = new THREE.Mesh(frameGeo, woodMat);
      frame.position.y = h * 0.5;
      group.add(frame);

      const shelfGeo = tracker.trackGeometry(new THREE.BoxGeometry(w - 0.2, 0.08, d + 0.08));
      const codexGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.42, 0.34, d * 0.65));
      for (let row = 0; row < 4; row += 1) {
        const sy = 0.5 + row * 0.7;
        const shelf = new THREE.Mesh(shelfGeo, woodMat);
        shelf.position.y = sy;
        group.add(shelf);
        for (let b = 0; b < 5; b += 1) {
          const bx = -w * 0.38 + b * (w * 0.19);
          const codex = new THREE.Mesh(codexGeo, b % 2 === 0 ? scrollMat : leatherMat);
          codex.position.set(bx, sy + 0.21, d * 0.24);
          group.add(codex);
        }
      }

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'box',
          position: spec.position,
          size: { x: w, y: h, z: d },
          yaw,
        });
      }
      break;
    }

    case 'table': {
      const w = num('width', 2.0);
      const h = num('height', 0.8);
      const d = num('depth', 1.4);
      const woodMat = mats.getMaterial(spec.material, 1, 1);

      const topGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, 0.1, d));
      const top = new THREE.Mesh(topGeo, woodMat);
      top.position.y = h - 0.05;
      group.add(top);

      const legGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.14, h - 0.1, 0.14));
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const leg = new THREE.Mesh(legGeo, woodMat);
          leg.position.set(sx * (w * 0.42), (h - 0.1) * 0.5, sz * (d * 0.42));
          group.add(leg);
        }
      }

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'box',
          position: spec.position,
          size: { x: w, y: h, z: d },
          yaw,
        });
      }
      break;
    }

    case 'stall': {
      const w = num('width', 4.2);
      const d = num('depth', 2.8);
      const h = num('height', 3.1);
      const awningColor = str('awningColor', '#9c3b2a');
      const woodMat = mats.getMaterial(spec.material, 1, 1);
      const awningMat = mats.getMaterial({ preset: 'carpet', tint: awningColor }, 2, 1);
      const sackMat = mats.getMaterial({ preset: 'sandstone', tint: '#cbb389' }, 1, 1);
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);

      const counterGeo = tracker.trackGeometry(new THREE.BoxGeometry(w, 0.9, d * 0.65));
      const counter = new THREE.Mesh(counterGeo, woodMat);
      counter.position.set(0, 0.45, 0);
      group.add(counter);

      const postGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.08, 0.09, h, 8));
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const post = new THREE.Mesh(postGeo, woodMat);
          post.position.set(sx * (w * 0.46), h * 0.5, sz * (d * 0.42));
          group.add(post);
        }
      }

      const canopyGeo = tracker.trackGeometry(new THREE.BoxGeometry(w + 0.5, 0.12, d + 0.4, 8, 1, 4));
      const canopy = new THREE.Mesh(canopyGeo, awningMat);
      canopy.position.set(0, h, 0);
      canopy.rotation.x = 0.12;
      canopy.userData.isWindAwning = true;
      group.add(canopy);

      // Spice sacks & brass bowls
      const sackGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.28, 0.34, 0.52, 10));
      for (let i = 0; i < 3; i += 1) {
        const sack = new THREE.Mesh(sackGeo, sackMat);
        sack.position.set(-w * 0.25 + i * 0.85, 1.15, 0.15);
        group.add(sack);
      }

      const vesselGeo = tracker.trackGeometry(new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.01, 0),
          new THREE.Vector2(0.22, 0.05),
          new THREE.Vector2(0.28, 0.25),
          new THREE.Vector2(0.14, 0.45),
          new THREE.Vector2(0.18, 0.55),
        ],
        12,
      ));
      const vessel = new THREE.Mesh(vesselGeo, brassMat);
      vessel.position.set(w * 0.3, 0.9, -0.1);
      group.add(vessel);

      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'box',
          position: spec.position,
          size: { x: w, y: h, z: d * 0.7 },
          yaw,
        });
      }
      break;
    }

    case 'horse': {
      const coat = str('coat', '#4e3524');
      const coatMat = mats.getMaterial({ preset: 'timber', tint: coat }, 1, 1);
      const maneMat = mats.getMaterial({ preset: 'iron', tint: '#1b1815' }, 1, 1);
      const saddleMat = mats.getMaterial({ preset: 'carpet', tint: '#8a2621' }, 1, 1);

      const torsoGeo = tracker.trackGeometry(new THREE.CapsuleGeometry(0.42, 1.1, 6, 12));
      const torso = new THREE.Mesh(torsoGeo, coatMat);
      torso.rotation.x = Math.PI * 0.5;
      torso.position.set(0, 1.25, 0);
      group.add(torso);

      const neckGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.18, 0.28, 0.85, 10));
      const neck = new THREE.Mesh(neckGeo, coatMat);
      neck.position.set(0, 1.72, 0.65);
      neck.rotation.x = 0.55;
      group.add(neck);

      const headGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.26, 0.28, 0.55));
      const head = new THREE.Mesh(headGeo, coatMat);
      head.position.set(0, 2.02, 0.98);
      head.rotation.x = 0.35;
      group.add(head);

      const legGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.08, 0.06, 1.15, 8));
      for (const lx of [-0.25, 0.25]) {
        for (const lz of [-0.48, 0.48]) {
          const leg = new THREE.Mesh(legGeo, coatMat);
          leg.position.set(lx, 0.575, lz);
          group.add(leg);
        }
      }

      const saddleGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.7, 0.14, 0.65));
      const saddle = new THREE.Mesh(saddleGeo, saddleMat);
      saddle.position.set(0, 1.65, -0.05);
      group.add(saddle);

      const tailGeo = tracker.trackGeometry(new THREE.ConeGeometry(0.12, 0.75, 8));
      const tail = new THREE.Mesh(tailGeo, maneMat);
      tail.position.set(0, 1.05, -0.82);
      tail.rotation.x = -0.35;
      group.add(tail);

      addContactShadow(group, 1.1, mats, tracker);
      setShadow(group, true, true);
      if (spec.collide) {
        colliders.push({
          shape: 'cylinder',
          position: spec.position,
          size: { x: 0.9, y: 2.0, z: 0 },
        });
      }
      break;
    }

    case 'astrolabe-prop': {
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);
      const standMat = mats.getMaterial({ preset: 'timber' }, 1, 1);
      const stand = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.16, 0.22, 0.14, 12)), standMat);
      stand.position.y = 0.07;
      group.add(stand);

      const ring = new THREE.Mesh(tracker.trackGeometry(new THREE.TorusGeometry(0.24, 0.028, 10, 24)), brassMat);
      ring.position.y = 0.4;
      group.add(ring);

      const plate = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20)), brassMat);
      plate.rotation.x = Math.PI * 0.5;
      plate.position.y = 0.4;
      group.add(plate);

      const pointer = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.42, 0.03, 0.035)), brassMat);
      pointer.position.y = 0.4;
      pointer.rotation.z = 0.55;
      group.add(pointer);
      setShadow(group, true, true);
      break;
    }

    case 'water-clock-prop': {
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);
      const stoneMat = mats.getMaterial({ preset: 'marble' }, 1, 1);
      const waterMat = mats.getMaterial({ preset: 'water' }, 1, 1);

      const ped = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.95, 0.95, 0.95)), stoneMat);
      ped.position.y = 0.475;
      group.add(ped);

      const vessel = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 16)), brassMat);
      vessel.position.y = 1.38;
      group.add(vessel);

      const dial = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 18)), brassMat);
      dial.rotation.x = Math.PI * 0.5;
      dial.position.set(0, 1.5, 0.34);
      group.add(dial);

      const pool = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 14)), waterMat);
      pool.position.y = 1.82;
      group.add(pool);
      addContactShadow(group, 0.8, mats, tracker);
      setShadow(group, true, true);
      break;
    }

    case 'oud-prop': {
      const woodMat = mats.getMaterial({ preset: 'timber', tint: '#7a4726' }, 1, 1);
      const lightWood = mats.getMaterial({ preset: 'sandstone', tint: '#d4b88e' }, 1, 1);

      const stand = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.25, 0.32, 0.55, 10)), woodMat);
      stand.position.y = -0.27;
      group.add(stand);

      const bowl = new THREE.Mesh(tracker.trackGeometry(new THREE.SphereGeometry(0.26, 16, 12)), woodMat);
      bowl.scale.set(1.0, 1.35, 0.65);
      bowl.position.y = 0.25;
      group.add(bowl);

      const face = new THREE.Mesh(tracker.trackGeometry(new THREE.CircleGeometry(0.24, 16)), lightWood);
      face.scale.set(1.0, 1.32, 1.0);
      face.position.set(0, 0.25, 0.17);
      group.add(face);

      const neck = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.08, 0.45, 0.06)), woodMat);
      neck.position.set(0, 0.72, 0.05);
      group.add(neck);
      setShadow(group, true, true);
      break;
    }

    case 'shatranj-prop': {
      const darkMat = mats.getMaterial({ preset: 'timber', tint: '#3d2415' }, 1, 1);
      const ivoryMat = mats.getMaterial({ preset: 'marble', tint: '#efe6d5' }, 1, 1);
      const board = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.85, 0.06, 0.85)), darkMat);
      board.position.y = 0.03;
      group.add(board);

      const inlay = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.72, 0.065, 0.72)), ivoryMat);
      inlay.position.y = 0.032;
      group.add(inlay);

      const pieceGeo = tracker.trackGeometry(new THREE.ConeGeometry(0.035, 0.11, 8));
      for (let i = 0; i < 6; i += 1) {
        const piece = new THREE.Mesh(pieceGeo, i % 2 === 0 ? darkMat : ivoryMat);
        piece.position.set(-0.22 + (i % 3) * 0.2, 0.11, i < 3 ? -0.2 : 0.2);
        group.add(piece);
      }
      setShadow(group, true, true);
      break;
    }

    case 'gold-dinar-prop': {
      const brassMat = mats.getMaterial({ preset: 'brass', tint: '#e6be5a' }, 1, 1);
      const cushionMat = mats.getMaterial({ preset: 'carpet', tint: '#6f1d1d' }, 1, 1);
      const tray = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.55, 0.08, 0.45)), cushionMat);
      tray.position.y = 0.04;
      group.add(tray);

      for (let i = 0; i < 3; i += 1) {
        const coin = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.065, 0.065, 0.015, 16)), brassMat);
        coin.position.set(-0.14 + i * 0.14, 0.09, 0);
        group.add(coin);
      }
      setShadow(group, true, true);
      break;
    }

    case 'manuscript-prop': {
      const paperMat = mats.getMaterial({ preset: 'plaster', tint: '#efe5cc' }, 1, 1);
      const inkMat = mats.getMaterial({ preset: 'iron' }, 1, 1);
      const sheet = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(0.6, 0.02, 0.45)), paperMat);
      sheet.position.y = 0.01;
      group.add(sheet);

      const scroll = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 10)), paperMat);
      scroll.rotation.z = Math.PI * 0.5;
      scroll.position.set(0, 0.05, -0.32);
      group.add(scroll);

      const inkwell = new THREE.Mesh(tracker.trackGeometry(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10)), inkMat);
      inkwell.position.set(0.4, 0.04, 0.1);
      group.add(inkwell);
      setShadow(group, true, true);
      break;
    }

    case 'teleport-door': {
      const woodMat = mats.getMaterial({ preset: 'timber', tint: '#54351e' }, 1, 2);
      const frameMat = mats.getMaterial({ preset: 'sandstone', tint: '#d4b47e' }, 1, 2);
      const brassMat = mats.getMaterial({ preset: 'brass' }, 1, 1);

      const jambGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.45, 3.3, 0.65));
      const jL = new THREE.Mesh(jambGeo, frameMat);
      jL.position.set(-1.15, 1.65, 0);
      group.add(jL);
      const jR = new THREE.Mesh(jambGeo, frameMat);
      jR.position.set(1.15, 1.65, 0);
      group.add(jR);

      const lintel = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(2.75, 0.55, 0.7)), frameMat);
      lintel.position.set(0, 3.45, 0);
      group.add(lintel);

      const door = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(1.85, 3.05, 0.2)), woodMat);
      door.position.set(0, 1.525, 0);
      group.add(door);

      const ring = new THREE.Mesh(tracker.trackGeometry(new THREE.TorusGeometry(0.11, 0.02, 8, 16)), brassMat);
      ring.position.set(0.45, 1.45, 0.13);
      group.add(ring);

      setShadow(group, true, true);
      break;
    }

    case 'scenic-orb': {
      const stoneMat = mats.getMaterial({ preset: 'sandstone', tint: '#D8AE66' }, 1, 1);
      const lapisMat = mats.getMaterial({ preset: 'blue-tile', tint: '#162B4D' }, 1, 1);
      const brassMat = mats.getMaterial({ preset: 'brass', tint: '#E8C988' }, 1, 1);
      const orbMat = tracker.trackMaterial(
        new THREE.MeshStandardMaterial({
          color: '#3A9BA8',
          emissive: '#3A9BA8',
          emissiveIntensity: 0.95,
          roughness: 0.2,
          metalness: 0.15,
        }),
      );

      // Stepped Abbasid sandstone & lapis pedestal
      const plinth = new THREE.Mesh(
        tracker.trackGeometry(new THREE.CylinderGeometry(0.5, 0.62, 0.28, 8)),
        stoneMat,
      );
      plinth.position.y = 0.14;
      group.add(plinth);

      const collar = new THREE.Mesh(
        tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.42, 0.72, 8)),
        lapisMat,
      );
      collar.position.y = 0.64;
      group.add(collar);

      // Floating orb & rotating astrolabe gimbal
      const spinner = new THREE.Group();
      spinner.position.y = 1.48;
      spinner.userData.orbSpinner = true;

      const coreOrb = new THREE.Mesh(
        tracker.trackGeometry(new THREE.SphereGeometry(0.26, 18, 14)),
        orbMat,
      );
      spinner.add(coreOrb);

      const gimbal = new THREE.Mesh(
        tracker.trackGeometry(new THREE.TorusGeometry(0.38, 0.028, 10, 28)),
        brassMat,
      );
      gimbal.rotation.x = Math.PI * 0.32;
      spinner.add(gimbal);

      const outerGimbal = new THREE.Mesh(
        tracker.trackGeometry(new THREE.TorusGeometry(0.45, 0.02, 8, 28)),
        brassMat,
      );
      outerGimbal.rotation.y = Math.PI * 0.4;
      spinner.add(outerGimbal);

      group.add(spinner);
      addContactShadow(group, 0.72, mats, tracker);
      setShadow(group, true, true);
      break;
    }

    default: {
      const fallback = new THREE.Mesh(
        tracker.trackGeometry(new THREE.BoxGeometry(1, 1, 1)),
        mats.getMaterial(spec.material),
      );
      fallback.position.y = 0.5;
      group.add(fallback);
    }
  }

  tracker.trackObject(group);
  return { group, colliders, waterMeshes, lanternLights };
}
