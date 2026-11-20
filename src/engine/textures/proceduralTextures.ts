import * as THREE from 'three';
import type { MaterialRef } from '../../contracts';
import type { ResourceTracker } from '../core/ResourceTracker';

function seededRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context for procedural texture');
  return [canvas, ctx];
}

function makeTexturePair(
  preset: MaterialRef['preset'],
  maxAniso: number,
  tracker: ResourceTracker,
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 256;
  const [albedoCanvas, aCtx] = makeCanvas(size);
  const [bumpCanvas, bCtx] = makeCanvas(size);
  const rand = seededRand(preset.length * 9173 + preset.charCodeAt(0) * 131);

  // Neutral white/light-gray base so material.color tints predictably without darkening
  aCtx.fillStyle = '#ece8df';
  aCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  if (preset === 'brick' || preset === 'sandstone' || preset === 'limestone' || preset === 'cobble') {
    const rows = preset === 'cobble' ? 8 : 6;
    const rowH = size / rows;
    for (let r = 0; r < rows; r += 1) {
      const cols = preset === 'cobble' ? 6 : 4;
      const colW = size / cols;
      const offset = (r % 2) * (colW * 0.5);
      for (let c = -1; c <= cols; c += 1) {
        const shade = Math.floor(215 + (rand() - 0.5) * 32);
        aCtx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`;
        aCtx.fillRect(c * colW + offset + 2, r * rowH + 2, colW - 4, rowH - 4);
        const bShade = Math.floor(145 + (rand() - 0.5) * 55);
        bCtx.fillStyle = `rgb(${bShade}, ${bShade}, ${bShade})`;
        bCtx.fillRect(c * colW + offset + 2, r * rowH + 2, colW - 4, rowH - 4);
      }
      // Mortar seams
      aCtx.fillStyle = 'rgba(120, 108, 92, 0.35)';
      aCtx.fillRect(0, r * rowH, size, 2);
      bCtx.fillStyle = '#383838';
      bCtx.fillRect(0, r * rowH, size, 3);
    }
    // Fine grain speckles
    for (let i = 0; i < 900; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const g = rand() > 0.5 ? 255 : 165;
      aCtx.fillStyle = `rgba(${g},${g},${g},0.12)`;
      aCtx.fillRect(x, y, 2, 2);
      bCtx.fillStyle = `rgba(${g},${g},${g},0.18)`;
      bCtx.fillRect(x, y, 2, 2);
    }
  } else if (preset === 'marble') {
    aCtx.fillStyle = '#f5f2ec';
    aCtx.fillRect(0, 0, size, size);
    aCtx.strokeStyle = 'rgba(170, 158, 138, 0.35)';
    for (let v = 0; v < 10; v += 1) {
      aCtx.lineWidth = 1 + rand() * 2;
      aCtx.beginPath();
      let x = rand() * size;
      let y = 0;
      aCtx.moveTo(x, y);
      for (let s = 1; s <= 6; s += 1) {
        x += (rand() - 0.5) * 48;
        y = (s / 6) * size;
        aCtx.lineTo(x, y);
      }
      aCtx.stroke();
    }
    // Subtle tile grid
    aCtx.strokeStyle = 'rgba(155, 145, 130, 0.25)';
    aCtx.lineWidth = 2;
    aCtx.strokeRect(1, 1, size - 2, size - 2);
    bCtx.strokeStyle = '#555555';
    bCtx.lineWidth = 2;
    bCtx.strokeRect(1, 1, size - 2, size - 2);
  } else if (preset === 'geometric-tile' || preset === 'emerald-tile' || preset === 'blue-tile') {
    aCtx.fillStyle = '#e7e2d6';
    aCtx.fillRect(0, 0, size, size);
    const step = 64;
    for (let gx = 0; gx < size; gx += step) {
      for (let gy = 0; gy < size; gy += step) {
        const cx = gx + step * 0.5;
        const cy = gy + step * 0.5;
        // 8-pointed star motif
        aCtx.strokeStyle = 'rgba(70, 56, 36, 0.42)';
        aCtx.lineWidth = 2;
        aCtx.strokeRect(gx + 6, gy + 6, step - 12, step - 12);
        aCtx.save();
        aCtx.translate(cx, cy);
        aCtx.rotate(Math.PI / 4);
        aCtx.strokeRect(-(step - 16) / 2, -(step - 16) / 2, step - 16, step - 16);
        aCtx.restore();

        bCtx.strokeStyle = '#4a4a4a';
        bCtx.lineWidth = 2;
        bCtx.strokeRect(gx + 2, gy + 2, step - 4, step - 4);
      }
    }
  } else if (preset === 'carpet') {
    aCtx.fillStyle = '#ddd4c8';
    aCtx.fillRect(0, 0, size, size);
    // Ornamental border and medallion
    aCtx.strokeStyle = 'rgba(210, 175, 95, 0.72)';
    aCtx.lineWidth = 10;
    aCtx.strokeRect(14, 14, size - 28, size - 28);
    aCtx.strokeStyle = 'rgba(55, 32, 26, 0.55)';
    aCtx.lineWidth = 4;
    aCtx.strokeRect(28, 28, size - 56, size - 56);
    aCtx.beginPath();
    aCtx.moveTo(size / 2, 42);
    aCtx.lineTo(size - 42, size / 2);
    aCtx.lineTo(size / 2, size - 42);
    aCtx.lineTo(42, size / 2);
    aCtx.closePath();
    aCtx.stroke();
    // Weave lines
    for (let y = 0; y < size; y += 4) {
      bCtx.fillStyle = y % 8 === 0 ? '#989898' : '#707070';
      bCtx.fillRect(0, y, size, 2);
    }
  } else if (preset === 'timber') {
    aCtx.fillStyle = '#ded3c4';
    aCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 3) {
      const v = Math.floor(195 + Math.sin(y * 0.14) * 20 + (rand() - 0.5) * 18);
      aCtx.fillStyle = `rgb(${v},${v - 8},${v - 18})`;
      aCtx.fillRect(0, y, size, 3);
      const bv = Math.floor(125 + Math.sin(y * 0.14) * 35);
      bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
      bCtx.fillRect(0, y, size, 3);
    }
  } else if (preset === 'grass' || preset === 'dirt') {
    for (let i = 0; i < 1600; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const v = Math.floor(190 + (rand() - 0.5) * 55);
      aCtx.fillStyle = `rgb(${v},${v},${v})`;
      aCtx.fillRect(x, y, 3, 3);
      const bv = Math.floor(128 + (rand() - 0.5) * 80);
      bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
      bCtx.fillRect(x, y, 2, 2);
    }
  } else {
    // plaster, brass, iron, water
    for (let i = 0; i < 700; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const v = Math.floor(225 + (rand() - 0.5) * 26);
      aCtx.fillStyle = `rgba(${v},${v},${v},0.35)`;
      aCtx.fillRect(x, y, 4, 4);
      const bv = Math.floor(128 + (rand() - 0.5) * 40);
      bCtx.fillStyle = `rgba(${bv},${bv},${bv},0.35)`;
      bCtx.fillRect(x, y, 3, 3);
    }
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAniso;

  tracker.trackTexture(map);
  tracker.trackTexture(bumpMap);
  return { map, bumpMap };
}

export class MaterialLibrary {
  private cache = new Map<string, THREE.MeshStandardMaterial>();
  private textures = new Map<string, { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }>();
  private contactShadowMat: THREE.MeshBasicMaterial | null = null;
  private tracker: ResourceTracker;
  private maxAniso: number;

  constructor(tracker: ResourceTracker, maxAniso: number) {
    this.tracker = tracker;
    this.maxAniso = maxAniso;
  }

  getMaterial(ref: MaterialRef, repeatX = 1, repeatY = 1): THREE.MeshStandardMaterial {
    const key = `${ref.preset}:${ref.tint ?? ''}:${repeatX}x${repeatY}`;
    const existing = this.cache.get(key);
    if (existing) return existing;

    let pair = this.textures.get(`${ref.preset}:${repeatX}x${repeatY}`);
    if (!pair) {
      const basePair =
        this.textures.get(`${ref.preset}:1x1`) ??
        makeTexturePair(ref.preset, this.maxAniso, this.tracker);
      this.textures.set(`${ref.preset}:1x1`, basePair);

      if (repeatX === 1 && repeatY === 1) {
        pair = basePair;
      } else {
        const clonedMap = basePair.map.clone();
        clonedMap.repeat.set(repeatX, repeatY);
        clonedMap.needsUpdate = true;
        const clonedBump = basePair.bumpMap.clone();
        clonedBump.repeat.set(repeatX, repeatY);
        clonedBump.needsUpdate = true;
        this.tracker.trackTexture(clonedMap);
        this.tracker.trackTexture(clonedBump);
        pair = { map: clonedMap, bumpMap: clonedBump };
        this.textures.set(`${ref.preset}:${repeatX}x${repeatY}`, pair);
      }
    }

    const defaults: Record<
      MaterialRef['preset'],
      { color: string; roughness: number; metalness: number; bumpScale: number }
    > = {
      sandstone: { color: '#d5b78b', roughness: 0.86, metalness: 0.04, bumpScale: 0.03 },
      limestone: { color: '#dfd6c2', roughness: 0.8, metalness: 0.05, bumpScale: 0.025 },
      brick: { color: '#c89b67', roughness: 0.88, metalness: 0.04, bumpScale: 0.04 },
      plaster: { color: '#e5d8bf', roughness: 0.84, metalness: 0.02, bumpScale: 0.015 },
      timber: { color: '#6b4528', roughness: 0.72, metalness: 0.06, bumpScale: 0.03 },
      marble: { color: '#e9e1cf', roughness: 0.34, metalness: 0.08, bumpScale: 0.01 },
      'blue-tile': { color: '#2b5d7a', roughness: 0.28, metalness: 0.14, bumpScale: 0.02 },
      'geometric-tile': { color: '#cbb079', roughness: 0.42, metalness: 0.1, bumpScale: 0.025 },
      'emerald-tile': { color: '#1d694d', roughness: 0.24, metalness: 0.18, bumpScale: 0.02 },
      carpet: { color: '#78211d', roughness: 0.92, metalness: 0.02, bumpScale: 0.035 },
      water: { color: '#2e747a', roughness: 0.12, metalness: 0.2, bumpScale: 0.015 },
      grass: { color: '#5f7d42', roughness: 0.94, metalness: 0.0, bumpScale: 0.03 },
      cobble: { color: '#c4a67c', roughness: 0.82, metalness: 0.04, bumpScale: 0.04 },
      dirt: { color: '#be9a6c', roughness: 0.95, metalness: 0.0, bumpScale: 0.03 },
      iron: { color: '#38383c', roughness: 0.42, metalness: 0.82, bumpScale: 0.02 },
      brass: { color: '#c9a24b', roughness: 0.24, metalness: 0.88, bumpScale: 0.015 },
    };

    const cfg = defaults[ref.preset] ?? defaults.sandstone;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ref.tint ?? cfg.color),
      map: pair.map,
      bumpMap: pair.bumpMap,
      bumpScale: cfg.bumpScale,
      roughness: cfg.roughness,
      metalness: cfg.metalness,
      transparent: ref.preset === 'water',
      opacity: ref.preset === 'water' ? 0.86 : 1.0,
    });

    this.tracker.trackMaterial(mat);
    this.cache.set(key, mat);
    return mat;
  }

  getContactShadowMaterial(): THREE.MeshBasicMaterial {
    if (this.contactShadowMat) return this.contactShadowMat;
    const [canvas, ctx] = makeCanvas(128);
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(12, 10, 8, 0.55)');
    grad.addColorStop(0.55, 'rgba(12, 10, 8, 0.25)');
    grad.addColorStop(1, 'rgba(12, 10, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.tracker.trackTexture(tex);

    this.contactShadowMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    this.tracker.trackMaterial(this.contactShadowMat);
    return this.contactShadowMat;
  }
}
