import * as THREE from 'three';
import type { QualityTier, ScatterSpec, TimeOfDayVariant, World } from '../../contracts';
import type { ResourceTracker } from '../core/ResourceTracker';
import type { CollisionWorld } from '../physics/CollisionWorld';
import type { MaterialLibrary } from '../textures/proceduralTextures';
import { buildPrefab } from './prefabs';
import { CharacterActor } from '../characters/CharacterActor';

export interface WalkerState {
  index: number;
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  phase: number;
  speed: number;
}

export interface BuiltWorldScene {
  root: THREE.Group;
  characters: Map<string, CharacterActor>;
  pickTargets: THREE.Object3D[];
  waterMeshes: THREE.Mesh[];
  lanternLights: THREE.PointLight[];
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  skyUniforms: {
    topColor: { value: THREE.Color };
    bottomColor: { value: THREE.Color };
  };
  walkerMesh: THREE.InstancedMesh | null;
  walkerBodyMesh: THREE.InstancedMesh | null;
  walkers: WalkerState[];
  applyTimeOfDay: (variant: TimeOfDayVariant) => void;
  update: (dt: number, elapsed: number, playerPos: THREE.Vector3) => void;
}

function seededRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleScatterPoints(spec: ScatterSpec): Array<{ x: number; z: number; scale: number; rot: number }> {
  const rand = seededRand(spec.seed);
  const pts: Array<{ x: number; z: number; scale: number; rot: number }> = [];
  const [minS, maxS] = spec.scale;

  for (let i = 0; i < spec.count; i += 1) {
    let x = 0;
    let z = 0;
    if ('center' in spec.area) {
      x = spec.area.center.x + (rand() - 0.5) * spec.area.size[0];
      z = spec.area.center.z + (rand() - 0.5) * spec.area.size[1];
    } else if (spec.area.path.length > 0) {
      const anchor = spec.area.path[i % spec.area.path.length];
      x = anchor.x + (rand() - 0.5) * spec.area.spread * 2;
      z = anchor.z + (rand() - 0.5) * spec.area.spread * 2;
    }
    pts.push({
      x,
      z,
      scale: minS + rand() * (maxS - minS),
      rot: rand() * Math.PI * 2,
    });
  }
  return pts;
}

export function buildWorldScene(
  world: World,
  scene: THREE.Scene,
  mats: MaterialLibrary,
  tracker: ResourceTracker,
  collisions: CollisionWorld,
  isSoftwareGl: boolean,
  quality: QualityTier,
): BuiltWorldScene {
  const root = new THREE.Group();
  root.name = `world:${world.id}`;
  scene.add(root);

  collisions.clear();
  collisions.setGroundY(world.scene.ground.y);
  collisions.setBounds({
    minX: world.scene.bounds.min[0],
    maxX: world.scene.bounds.max[0],
    minZ: world.scene.bounds.min[1],
    maxZ: world.scene.bounds.max[1],
  });

  // Vast surrounding desert horizon ground (prevents empty void!)
  const horizonGroundGeo = tracker.trackGeometry(new THREE.PlaneGeometry(520, 520));
  const horizonGroundMat = mats.getMaterial(world.scene.ground.material, 64, 64);
  const horizonGround = new THREE.Mesh(horizonGroundGeo, horizonGroundMat);
  horizonGround.rotation.x = -Math.PI / 2;
  horizonGround.position.y = world.scene.ground.y;
  horizonGround.receiveShadow = true;
  root.add(horizonGround);

  // Outer Round City ring wall silhouette & distant Tigris horizon palms
  const ringWallMat = mats.getMaterial({ preset: 'brick', tint: '#b88d5d' }, 12, 2);
  const ringSegGeo = tracker.trackGeometry(new THREE.BoxGeometry(22, 7.5, 2.2));
  const ringSegMesh = new THREE.InstancedMesh(ringSegGeo, ringWallMat, 24);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * Math.PI * 2;
    const rad = 115;
    dummy.position.set(Math.cos(angle) * rad, 3.75, Math.sin(angle) * rad);
    dummy.rotation.set(0, -angle + Math.PI * 0.5, 0);
    dummy.scale.set(1, 0.9 + (i % 3) * 0.15, 1);
    dummy.updateMatrix();
    ringSegMesh.setMatrixAt(i, dummy.matrix);
  }
  ringSegMesh.instanceMatrix.needsUpdate = true;
  ringSegMesh.computeBoundingSphere();
  root.add(ringSegMesh);

  // Sky gradient dome
  const skyUniforms = {
    topColor: { value: new THREE.Color(world.theme.skyTop) },
    bottomColor: { value: new THREE.Color(world.theme.skyBottom) },
  };
  const skyGeo = tracker.trackGeometry(new THREE.SphereGeometry(280, 24, 16));
  const skyMat = tracker.trackMaterial(
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y;
          float t = clamp(h * 0.9 + 0.15, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(t, 0.7)), 1.0);
        }
      `,
    }),
  );
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  root.add(skyMesh);

  // Exponential horizon fog matching Abbasid Lapis & Sandstone horizon
  scene.background = new THREE.Color(world.theme.fogColor);
  scene.fog = new THREE.FogExp2(world.theme.fogColor, 0.0052);

  // Warm key sun + cool sky / warm sand hemisphere fill
  const lighting = world.theme.lighting;
  const sunLight = new THREE.DirectionalLight(
    lighting?.sunColor ?? '#ffe3b3',
    lighting?.sunIntensity ?? 2.3,
  );
  const sunDir = lighting?.sunDirection ?? { x: -55, y: 42, z: 32 };
  sunLight.position.set(sunDir.x, sunDir.y, sunDir.z);
  sunLight.castShadow = !isSoftwareGl && quality !== 'low';
  sunLight.shadow.mapSize.width = quality === 'high' ? 2048 : 1024;
  sunLight.shadow.mapSize.height = quality === 'high' ? 2048 : 1024;
  const shadowSize = 42;
  sunLight.shadow.camera.left = -shadowSize;
  sunLight.shadow.camera.right = shadowSize;
  sunLight.shadow.camera.top = shadowSize;
  sunLight.shadow.camera.bottom = -shadowSize;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 180;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
  root.add(sunLight);
  root.add(sunLight.target);

  const hemiLight = new THREE.HemisphereLight(
    lighting?.hemiSkyColor ?? '#bcd6ec',
    lighting?.hemiGroundColor ?? '#c9a679',
    lighting?.hemiIntensity ?? 0.72,
  );
  root.add(hemiLight);

  // Build declarative architecture prefabs
  const waterMeshes: THREE.Mesh[] = [];
  for (const prefab of world.scene.prefabs) {
    const built = buildPrefab(prefab, mats, tracker);
    root.add(built.group);
    for (const c of built.colliders) {
      collisions.addCollider(`${prefab.id}:${collisions ? Math.random() : ''}`, c);
    }
    if (built.waterMeshes) waterMeshes.push(...built.waterMeshes);
  }

  // Build interactive objects (visual prop + layer-1 pick sphere)
  const pickTargets: THREE.Object3D[] = [];
  for (const obj of world.objects) {
    const built = buildPrefab(
      {
        id: `obj:${obj.id}`,
        prefab: obj.prefab,
        position: obj.position,
        rotation: obj.rotation,
        params: {},
        material: { preset: 'brass' },
        collide: obj.id === 'court-fountain',
      },
      mats,
      tracker,
    );
    root.add(built.group);
    for (const c of built.colliders) {
      collisions.addCollider(`obj-col:${obj.id}`, c);
    }
    if (built.waterMeshes) waterMeshes.push(...built.waterMeshes);

    // Layer-1 pick volume
    const pickGeo = tracker.trackGeometry(new THREE.SphereGeometry(obj.id === 'court-fountain' ? 3.2 : 0.95, 10, 8));
    const pickMat = tracker.trackMaterial(
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    const pickSphere = new THREE.Mesh(pickGeo, pickMat);
    pickSphere.position.set(obj.position.x, obj.position.y + 0.8, obj.position.z);
    pickSphere.layers.set(1);
    pickSphere.userData = {
      targetType: 'object',
      targetId: obj.id,
      prompt: obj.prompt,
      interactionRadius: obj.interactionRadius,
    };
    root.add(pickSphere);
    pickTargets.push(pickSphere);
  }

  // Collect scenic orb spinners and wind-swaying bazaar awnings
  const orbSpinners: THREE.Object3D[] = [];
  const windAwnings: THREE.Object3D[] = [];
  root.traverse((obj) => {
    if (obj.userData?.orbSpinner) orbSpinners.push(obj);
    if (obj.userData?.isWindAwning) windAwnings.push(obj);
  });

  // GPU-efficient golden dust motes & lantern embers (InstancedMesh, zero Points overhead)
  const dustCount = isSoftwareGl ? 18 : quality === 'low' ? 24 : 52;
  const dustGeo = tracker.trackGeometry(new THREE.OctahedronGeometry(0.055, 0));
  const dustMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({
      color: '#FFE6A7',
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );
  const dustInst = new THREE.InstancedMesh(dustGeo, dustMat, dustCount);
  dustInst.frustumCulled = false;
  const dustSeeds: Array<{ x: number; y: number; z: number; phase: number; speed: number }> = [];
  const dustRand = seededRand(8009);
  for (let i = 0; i < dustCount; i += 1) {
    dustSeeds.push({
      x: (dustRand() - 0.5) * 105,
      y: 0.9 + dustRand() * 4.5,
      z: (dustRand() - 0.5) * 105,
      phase: dustRand() * Math.PI * 2,
      speed: 0.35 + dustRand() * 0.45,
    });
  }
  root.add(dustInst);

  // Scatter instanced foliage, lanterns, and crowd walkers
  const lanternPositions: THREE.Vector3[] = [];
  const walkers: WalkerState[] = [];
  let walkerMesh: THREE.InstancedMesh | null = null;
  let walkerBodyMesh: THREE.InstancedMesh | null = null;

  const densityMult = quality === 'low' ? 0.5 : 1.0;

  // Palm instancing
  const palmPts: Array<{ x: number; z: number; scale: number; rot: number }> = [];
  const pomegranatePts: Array<{ x: number; z: number; scale: number; rot: number }> = [];
  const lanternPts: Array<{ x: number; z: number; scale: number; rot: number }> = [];
  const walkerPts: Array<{ x: number; z: number; scale: number; rot: number }> = [];

  for (const sc of world.scene.scatter) {
    const pts = sampleScatterPoints(sc);
    const limit = Math.max(1, Math.round(pts.length * densityMult));
    const subset = pts.slice(0, limit);
    if (sc.prefab === 'palm') palmPts.push(...subset);
    else if (sc.prefab === 'pomegranate-tree') pomegranatePts.push(...subset);
    else if (sc.prefab === 'lantern') lanternPts.push(...subset);
    else if (sc.prefab === 'walker') walkerPts.push(...subset);
  }

  if (palmPts.length > 0) {
    const trunkGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.18, 0.34, 6.2, 8));
    trunkGeo.translate(0, 3.1, 0);
    const trunkMat = mats.getMaterial({ preset: 'timber', tint: '#755336' }, 1, 3);
    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, palmPts.length);
    trunkInst.castShadow = !isSoftwareGl;

    const crownGeo = tracker.trackGeometry(new THREE.ConeGeometry(2.3, 1.7, 7));
    crownGeo.translate(0, 6.4, 0);
    const crownMat = mats.getMaterial({ preset: 'grass', tint: '#4b6b32' }, 2, 1);
    const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, palmPts.length);
    crownInst.castShadow = !isSoftwareGl;

    palmPts.forEach((pt, idx) => {
      dummy.position.set(pt.x, 0, pt.z);
      dummy.rotation.set(0.05, pt.rot, 0.04);
      dummy.scale.setScalar(pt.scale);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(idx, dummy.matrix);
      crownInst.setMatrixAt(idx, dummy.matrix);

      collisions.addCollider(`palm:${idx}`, {
        shape: 'cylinder',
        position: { x: pt.x, y: 0, z: pt.z },
        size: { x: 0.35 * pt.scale, y: 5, z: 0 },
      });
    });
    trunkInst.instanceMatrix.needsUpdate = true;
    crownInst.instanceMatrix.needsUpdate = true;
    trunkInst.computeBoundingSphere();
    crownInst.computeBoundingSphere();
    root.add(trunkInst, crownInst);
  }

  if (pomegranatePts.length > 0) {
    const pTrunkGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.12, 0.18, 2.0, 7));
    pTrunkGeo.translate(0, 1.0, 0);
    const pTrunkMat = mats.getMaterial({ preset: 'timber', tint: '#5a3d27' }, 1, 1);
    const pTrunkInst = new THREE.InstancedMesh(pTrunkGeo, pTrunkMat, pomegranatePts.length);

    const pCanopyGeo = tracker.trackGeometry(new THREE.DodecahedronGeometry(1.15, 0));
    pCanopyGeo.translate(0, 2.5, 0);
    const pCanopyMat = mats.getMaterial({ preset: 'grass', tint: '#3f622c' }, 1, 1);
    const pCanopyInst = new THREE.InstancedMesh(pCanopyGeo, pCanopyMat, pomegranatePts.length);

    pomegranatePts.forEach((pt, idx) => {
      dummy.position.set(pt.x, 0, pt.z);
      dummy.rotation.set(0, pt.rot, 0);
      dummy.scale.setScalar(pt.scale);
      dummy.updateMatrix();
      pTrunkInst.setMatrixAt(idx, dummy.matrix);
      pCanopyInst.setMatrixAt(idx, dummy.matrix);
    });
    pTrunkInst.instanceMatrix.needsUpdate = true;
    pCanopyInst.instanceMatrix.needsUpdate = true;
    pTrunkInst.computeBoundingSphere();
    pCanopyInst.computeBoundingSphere();
    root.add(pTrunkInst, pCanopyInst);
  }

  if (lanternPts.length > 0) {
    const postGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.06, 0.09, 2.4, 8));
    postGeo.translate(0, 1.2, 0);
    const postMat = mats.getMaterial({ preset: 'iron' }, 1, 1);
    const postInst = new THREE.InstancedMesh(postGeo, postMat, lanternPts.length);

    const globeGeo = tracker.trackGeometry(new THREE.OctahedronGeometry(0.2, 0));
    globeGeo.translate(0, 2.55, 0);
    const globeMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#ffd98a',
        emissive: '#ffaa3b',
        emissiveIntensity: 0.7,
        roughness: 0.3,
      }),
    );
    const globeInst = new THREE.InstancedMesh(globeGeo, globeMat, lanternPts.length);

    lanternPts.forEach((pt, idx) => {
      dummy.position.set(pt.x, 0, pt.z);
      dummy.rotation.set(0, pt.rot, 0);
      dummy.scale.setScalar(pt.scale);
      dummy.updateMatrix();
      postInst.setMatrixAt(idx, dummy.matrix);
      globeInst.setMatrixAt(idx, dummy.matrix);
      lanternPositions.push(new THREE.Vector3(pt.x, 2.55, pt.z));
    });
    postInst.instanceMatrix.needsUpdate = true;
    globeInst.instanceMatrix.needsUpdate = true;
    postInst.computeBoundingSphere();
    globeInst.computeBoundingSphere();
    root.add(postInst, globeInst);
  }

  // Up to 4 active unshadowed point lights for dusk/interior glow (strictly <= 6 budget)
  const lanternLights: THREE.PointLight[] = [];
  for (let i = 0; i < 4; i += 1) {
    const pt = lanternPositions[i] ?? new THREE.Vector3(0, 3.2, -32);
    const light = new THREE.PointLight('#ffaa4b', 0.4, 18, 1.8);
    light.position.copy(pt);
    root.add(light);
    lanternLights.push(light);
  }

  // Instanced background walkers (servants, guards, merchants)
  if (walkerPts.length > 0) {
    const wRobeGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.22, 0.31, 1.38, 10));
    wRobeGeo.translate(0, 0.69, 0);
    const wRobeMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 }),
    );
    walkerBodyMesh = new THREE.InstancedMesh(wRobeGeo, wRobeMat, walkerPts.length);
    walkerBodyMesh.frustumCulled = false;

    const wHeadGeo = tracker.trackGeometry(new THREE.SphereGeometry(0.16, 10, 8));
    wHeadGeo.translate(0, 1.54, 0);
    const wHeadMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#e5dac4', roughness: 0.8 }),
    );
    walkerMesh = new THREE.InstancedMesh(wHeadGeo, wHeadMat, walkerPts.length);
    walkerMesh.frustumCulled = false;

    const colors = ['#594534', '#394652', '#6b4d2e', '#46342b', '#2b282b'];
    const c = new THREE.Color();
    walkerPts.forEach((pt, idx) => {
      c.set(colors[idx % colors.length]);
      walkerBodyMesh?.setColorAt(idx, c);
      walkers.push({
        index: idx,
        centerX: pt.x,
        centerZ: pt.z,
        radiusX: 2.2 + (idx % 3) * 1.4,
        radiusZ: 2.0 + ((idx + 1) % 3) * 1.3,
        phase: pt.rot,
        speed: 0.35 + (idx % 4) * 0.1,
      });
    });
    if (walkerBodyMesh.instanceColor) walkerBodyMesh.instanceColor.needsUpdate = true;
    root.add(walkerBodyMesh, walkerMesh);
  }

  // Build hero Characters
  const characters = new Map<string, CharacterActor>();
  for (const ch of world.characters) {
    const actor = new CharacterActor(ch, mats, tracker);
    root.add(actor.root);
    characters.set(ch.id, actor);
    pickTargets.push(actor.pickMesh);
    collisions.addCollider(
      `char:${ch.id}`,
      {
        shape: 'cylinder',
        position: ch.placement.position,
        size: { x: 0.45, y: 1.7, z: 0 },
      },
      true,
    );
  }

  const applyTimeOfDay = (variant: TimeOfDayVariant) => {
    const dusk = world.theme.lighting?.dusk;
    if (variant === 'dusk' && dusk) {
      skyUniforms.topColor.value.set(dusk.skyTop);
      skyUniforms.bottomColor.value.set(dusk.skyBottom);
      scene.background = new THREE.Color(dusk.fogColor);
      scene.fog = new THREE.FogExp2(dusk.fogColor, 0.0072);
      sunLight.color.set(dusk.sunColor);
      sunLight.intensity = dusk.sunIntensity;
      sunLight.position.set(dusk.sunDirection.x, dusk.sunDirection.y, dusk.sunDirection.z);
      hemiLight.intensity = 0.38;
      lanternLights.forEach((l) => {
        l.intensity = dusk.lanternIntensity;
      });
    } else {
      skyUniforms.topColor.value.set(world.theme.skyTop);
      skyUniforms.bottomColor.value.set(world.theme.skyBottom);
      scene.background = new THREE.Color(world.theme.fogColor);
      scene.fog = new THREE.FogExp2(world.theme.fogColor, 0.0052);
      sunLight.color.set(lighting?.sunColor ?? '#ffe3b3');
      sunLight.intensity = lighting?.sunIntensity ?? 2.35;
      sunLight.position.set(sunDir.x, sunDir.y, sunDir.z);
      hemiLight.intensity = lighting?.hemiIntensity ?? 0.78;
      lanternLights.forEach((l) => {
        l.intensity = 0.4;
      });
    }
  };

  const _dummyWalker = new THREE.Object3D();
  const _dummyDust = new THREE.Object3D();

  const update = (dt: number, elapsed: number, playerPos: THREE.Vector3) => {
    // Update characters
    for (const actor of characters.values()) {
      actor.update(dt, playerPos);
    }

    // Subtle fountain & channel ripple + emissive shimmer
    for (let i = 0; i < waterMeshes.length; i += 1) {
      const m = waterMeshes[i];
      m.position.y += Math.sin(elapsed * 3.2 + i) * 0.0003;
      const mat = m.material;
      if (mat instanceof THREE.MeshStandardMaterial && mat.map) {
        mat.map.offset.x = (elapsed * 0.03) % 1;
        mat.map.offset.y = (elapsed * 0.018) % 1;
      }
    }

    // Animate glowing scenic orbs
    for (let i = 0; i < orbSpinners.length; i += 1) {
      const sp = orbSpinners[i];
      sp.rotation.y = elapsed * 0.85 + i;
      sp.position.y = 1.48 + Math.sin(elapsed * 2.1 + i) * 0.08;
    }

    // Gentle breeze flutter on market awnings
    for (let i = 0; i < windAwnings.length; i += 1) {
      windAwnings[i].rotation.x = 0.12 + Math.sin(elapsed * 1.9 + i * 1.3) * 0.025;
    }

    // Animate golden dust motes & embers
    for (let i = 0; i < dustSeeds.length; i += 1) {
      const d = dustSeeds[i];
      const t = elapsed * d.speed + d.phase;
      _dummyDust.position.set(
        d.x + Math.sin(t * 0.8) * 1.1,
        d.y + Math.cos(t * 1.1) * 0.35,
        d.z + Math.cos(t * 0.7) * 1.1,
      );
      const s = 0.75 + Math.sin(t * 2.2) * 0.25;
      _dummyDust.scale.setScalar(s);
      _dummyDust.updateMatrix();
      dustInst.setMatrixAt(i, _dummyDust.matrix);
    }
    dustInst.instanceMatrix.needsUpdate = true;

    // Animate background instanced walkers along gentle loops
    if (walkerMesh && walkerBodyMesh && walkers.length > 0) {
      for (let i = 0; i < walkers.length; i += 1) {
        const w = walkers[i];
        const t = elapsed * w.speed + w.phase;
        const wx = w.centerX + Math.cos(t) * w.radiusX;
        const wz = w.centerZ + Math.sin(t) * w.radiusZ;
        const bob = Math.abs(Math.sin(t * 7)) * 0.04;
        const facing = Math.atan2(-Math.sin(t) * w.radiusX, Math.cos(t) * w.radiusZ);

        _dummyWalker.position.set(wx, bob, wz);
        _dummyWalker.rotation.set(0, facing, 0);
        _dummyWalker.scale.set(1, 1, 1);
        _dummyWalker.updateMatrix();
        walkerBodyMesh.setMatrixAt(w.index, _dummyWalker.matrix);
        walkerMesh.setMatrixAt(w.index, _dummyWalker.matrix);
      }
      walkerBodyMesh.instanceMatrix.needsUpdate = true;
      walkerMesh.instanceMatrix.needsUpdate = true;
    }
  };

  return {
    root,
    characters,
    pickTargets,
    waterMeshes,
    lanternLights,
    sunLight,
    hemiLight,
    skyUniforms,
    walkerMesh,
    walkerBodyMesh,
    walkers,
    applyTimeOfDay,
    update,
  };
}
