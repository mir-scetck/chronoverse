import * as THREE from 'three';

export class ResourceTracker {
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();

  trackGeometry<T extends THREE.BufferGeometry>(geom: T): T {
    this.geometries.add(geom);
    return geom;
  }

  trackMaterial<T extends THREE.Material>(mat: T): T {
    this.materials.add(mat);
    return mat;
  }

  trackTexture<T extends THREE.Texture>(tex: T): T {
    this.textures.add(tex);
    return tex;
  }

  trackObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
        if (child.geometry) {
          this.geometries.add(child.geometry);
        }
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          if (!m) continue;
          this.materials.add(m);
          const rec = m as unknown as Record<string, unknown>;
          for (const key of ['map', 'bumpMap', 'roughnessMap', 'normalMap', 'alphaMap', 'emissiveMap']) {
            const val = rec[key];
            if (val instanceof THREE.Texture) {
              this.textures.add(val);
            }
          }
        }
      }
    });
  }

  disposeAll(): void {
    for (const tex of this.textures) {
      tex.dispose();
    }
    this.textures.clear();

    for (const mat of this.materials) {
      mat.dispose();
    }
    this.materials.clear();

    for (const geom of this.geometries) {
      geom.dispose();
    }
    this.geometries.clear();
  }
}
