import type { ColliderSpec } from '../../contracts';

export interface PlayerBody {
  x: number;
  y: number; // feet Y
  z: number;
  vx: number;
  vy: number;
  vz: number;
  grounded: boolean;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const PLAYER_RADIUS = 0.35;
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_EYE_HEIGHT = 1.6;
export const STEP_HEIGHT = 0.35;
export const GRAVITY = 20;
export const TERMINAL_FALL_SPEED = 25;

export class CollisionWorld {
  private staticColliders = new Map<string, ColliderSpec>();
  private dynamicColliders = new Map<string, ColliderSpec>();
  private cellMap = new Map<string, ColliderSpec[]>();
  private readonly cellSize = 4;
  private bounds: WorldBounds | null = null;
  private groundY = 0;

  // Reusable query buffer to avoid allocations in hot paths
  private queryResult: ColliderSpec[] = [];
  private seenIds = new Set<ColliderSpec>();

  setGroundY(y: number): void {
    this.groundY = y;
  }

  setBounds(bounds: WorldBounds | null): void {
    this.bounds = bounds;
  }

  clear(): void {
    this.staticColliders.clear();
    this.dynamicColliders.clear();
    this.cellMap.clear();
  }

  addCollider(id: string, spec: ColliderSpec, dynamic = false): void {
    const withId: ColliderSpec = { ...spec, id };
    if (dynamic) {
      this.dynamicColliders.set(id, withId);
      return;
    }
    this.staticColliders.set(id, withId);
    this.insertIntoSpatialHash(withId);
  }

  removeCollider(id: string): void {
    if (this.dynamicColliders.delete(id)) return;
    if (this.staticColliders.delete(id)) {
      this.rebuildSpatialHash();
    }
  }

  private getAABB(c: ColliderSpec): { minX: number; maxX: number; minZ: number; maxZ: number } {
    if (c.shape === 'cylinder') {
      const r = c.size.x;
      return {
        minX: c.position.x - r,
        maxX: c.position.x + r,
        minZ: c.position.z - r,
        maxZ: c.position.z + r,
      };
    }
    const hw = c.size.x * 0.5;
    const hd = c.size.z * 0.5;
    const yaw = c.yaw ?? 0;
    if (Math.abs(yaw) < 1e-4) {
      return {
        minX: c.position.x - hw,
        maxX: c.position.x + hw,
        minZ: c.position.z - hd,
        maxZ: c.position.z + hd,
      };
    }
    const cos = Math.abs(Math.cos(yaw));
    const sin = Math.abs(Math.sin(yaw));
    const rx = hw * cos + hd * sin;
    const rz = hw * sin + hd * cos;
    return {
      minX: c.position.x - rx,
      maxX: c.position.x + rx,
      minZ: c.position.z - rz,
      maxZ: c.position.z + rz,
    };
  }

  private insertIntoSpatialHash(c: ColliderSpec): void {
    const aabb = this.getAABB(c);
    const minCX = Math.floor(aabb.minX / this.cellSize);
    const maxCX = Math.floor(aabb.maxX / this.cellSize);
    const minCZ = Math.floor(aabb.minZ / this.cellSize);
    const maxCZ = Math.floor(aabb.maxZ / this.cellSize);

    for (let cx = minCX; cx <= maxCX; cx += 1) {
      for (let cz = minCZ; cz <= maxCZ; cz += 1) {
        const key = `${cx},${cz}`;
        let arr = this.cellMap.get(key);
        if (!arr) {
          arr = [];
          this.cellMap.set(key, arr);
        }
        arr.push(c);
      }
    }
  }

  private rebuildSpatialHash(): void {
    this.cellMap.clear();
    for (const c of this.staticColliders.values()) {
      this.insertIntoSpatialHash(c);
    }
  }

  private queryNearby(x: number, z: number, radius: number): ColliderSpec[] {
    this.queryResult.length = 0;
    this.seenIds.clear();

    const minCX = Math.floor((x - radius) / this.cellSize);
    const maxCX = Math.floor((x + radius) / this.cellSize);
    const minCZ = Math.floor((z - radius) / this.cellSize);
    const maxCZ = Math.floor((z + radius) / this.cellSize);

    for (let cx = minCX; cx <= maxCX; cx += 1) {
      for (let cz = minCZ; cz <= maxCZ; cz += 1) {
        const arr = this.cellMap.get(`${cx},${cz}`);
        if (!arr) continue;
        for (let i = 0; i < arr.length; i += 1) {
          const item = arr[i];
          if (!this.seenIds.has(item)) {
            this.seenIds.add(item);
            this.queryResult.push(item);
          }
        }
      }
    }

    for (const dyn of this.dynamicColliders.values()) {
      this.queryResult.push(dyn);
    }

    return this.queryResult;
  }

  step(body: PlayerBody, dt: number): void {
    const clampedDt = Math.min(Math.max(dt, 0), 0.1);
    if (clampedDt === 0) return;

    // Horizontal sub-stepping to prevent tunneling through thin walls
    const horizDist = Math.hypot(body.vx * clampedDt, body.vz * clampedDt);
    const maxStep = PLAYER_RADIUS * 0.45;
    const subSteps = Math.max(1, Math.min(16, Math.ceil(horizDist / maxStep)));
    const subDt = clampedDt / subSteps;

    for (let s = 0; s < subSteps; s += 1) {
      body.x += body.vx * subDt;
      body.z += body.vz * subDt;
      this.resolveHorizontal(body);
    }

    // Vertical gravity & ground/walkable-top/ceiling resolution
    body.vy = Math.max(-TERMINAL_FALL_SPEED, body.vy - GRAVITY * clampedDt);
    const nextY = body.y + body.vy * clampedDt;

    const candidates = this.queryNearby(body.x, body.z, PLAYER_RADIUS + 0.5);
    let supportY = this.groundY;
    let ceilingY = Infinity;

    for (let i = 0; i < candidates.length; i += 1) {
      const c = candidates[i];
      if (!this.overlapsHoriz(body.x, body.z, PLAYER_RADIUS - 0.02, c)) continue;

      const cBottom = c.position.y;
      const cTop = c.position.y + c.size.y;

      if (c.walkableTop) {
        // Can stand or step up onto walkableTop if within step height
        if (cTop <= body.y + STEP_HEIGHT + 0.01 && cTop > supportY) {
          supportY = cTop;
        }
      }

      // Ceiling check
      if (cBottom >= body.y + PLAYER_HEIGHT * 0.5 && cBottom < ceilingY) {
        ceilingY = cBottom;
      }
    }

    if (nextY <= supportY + 0.05 && body.vy <= 0 && nextY >= supportY - 0.45) {
      body.y = supportY;
      body.vy = 0;
      body.grounded = true;
    } else if (nextY < supportY) {
      body.y = supportY;
      body.vy = 0;
      body.grounded = true;
    } else {
      body.y = nextY;
      body.grounded = false;
    }

    if (body.y + PLAYER_HEIGHT > ceilingY) {
      body.y = Math.max(supportY, ceilingY - PLAYER_HEIGHT);
      if (body.vy > 0) body.vy = 0;
    }

    this.clampBounds(body);
  }

  pushOut(body: PlayerBody): void {
    this.resolveHorizontal(body);
    this.clampBounds(body);
  }

  private clampBounds(body: PlayerBody): void {
    if (!this.bounds) return;
    const minX = this.bounds.minX + PLAYER_RADIUS;
    const maxX = this.bounds.maxX - PLAYER_RADIUS;
    const minZ = this.bounds.minZ + PLAYER_RADIUS;
    const maxZ = this.bounds.maxZ - PLAYER_RADIUS;

    if (body.x < minX) {
      body.x = minX;
      if (body.vx < 0) body.vx = 0;
    } else if (body.x > maxX) {
      body.x = maxX;
      if (body.vx > 0) body.vx = 0;
    }

    if (body.z < minZ) {
      body.z = minZ;
      if (body.vz < 0) body.vz = 0;
    } else if (body.z > maxZ) {
      body.z = maxZ;
      if (body.vz > 0) body.vz = 0;
    }
  }

  private overlapsHoriz(px: number, pz: number, radius: number, c: ColliderSpec): boolean {
    if (c.shape === 'cylinder') {
      const dx = px - c.position.x;
      const dz = pz - c.position.z;
      const rSum = radius + c.size.x;
      return dx * dx + dz * dz < rSum * rSum;
    }

    const yaw = c.yaw ?? 0;
    const dx = px - c.position.x;
    const dz = pz - c.position.z;
    const cos = Math.cos(-yaw);
    const sin = Math.sin(-yaw);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;
    const hw = c.size.x * 0.5;
    const hd = c.size.z * 0.5;
    const clampedX = Math.max(-hw, Math.min(hw, localX));
    const clampedZ = Math.max(-hd, Math.min(hd, localZ));
    const distX = localX - clampedX;
    const distZ = localZ - clampedZ;
    return distX * distX + distZ * distZ < radius * radius;
  }

  private resolveHorizontal(body: PlayerBody): void {
    for (let iter = 0; iter < 3; iter += 1) {
      const candidates = this.queryNearby(body.x, body.z, PLAYER_RADIUS + 0.5);
      let pushed = false;

      for (let i = 0; i < candidates.length; i += 1) {
        const c = candidates[i];
        const cBottom = c.position.y;
        const cTop = c.position.y + c.size.y;

        // Vertical overlap check (skip colliders completely below step height or above head)
        if (cTop <= body.y + 0.01) continue;
        if (cBottom >= body.y + PLAYER_HEIGHT - 0.01) continue;

        // Walkable top within step height: allow stepping onto it instead of blocking horizontally
        if (c.walkableTop && cTop <= body.y + STEP_HEIGHT + 0.01) {
          continue;
        }

        if (c.shape === 'cylinder') {
          const dx = body.x - c.position.x;
          const dz = body.z - c.position.z;
          const rSum = PLAYER_RADIUS + c.size.x;
          const distSq = dx * dx + dz * dz;
          if (distSq >= rSum * rSum) continue;

          const dist = Math.sqrt(distSq);
          let nx = 1;
          let nz = 0;
          if (dist > 1e-5) {
            nx = dx / dist;
            nz = dz / dist;
          }
          const pen = rSum - dist;
          body.x += nx * pen;
          body.z += nz * pen;

          const vn = body.vx * nx + body.vz * nz;
          if (vn < 0) {
            body.vx -= vn * nx;
            body.vz -= vn * nz;
          }
          pushed = true;
        } else {
          const yaw = c.yaw ?? 0;
          const cos = Math.cos(-yaw);
          const sin = Math.sin(-yaw);
          const relX = body.x - c.position.x;
          const relZ = body.z - c.position.z;
          const localX = relX * cos - relZ * sin;
          const localZ = relX * sin + relZ * cos;

          const hw = c.size.x * 0.5;
          const hd = c.size.z * 0.5;
          const clampedX = Math.max(-hw, Math.min(hw, localX));
          const clampedZ = Math.max(-hd, Math.min(hd, localZ));

          let diffX = localX - clampedX;
          let diffZ = localZ - clampedZ;
          const distSq = diffX * diffX + diffZ * diffZ;

          if (distSq >= PLAYER_RADIUS * PLAYER_RADIUS) continue;

          let localNx = 0;
          let localNz = 0;
          let pen = 0;

          if (distSq > 1e-8) {
            const dist = Math.sqrt(distSq);
            localNx = diffX / dist;
            localNz = diffZ / dist;
            pen = PLAYER_RADIUS - dist;
          } else {
            // Center of circle is inside box: push out along nearest face
            const penLeft = localX + hw;
            const penRight = hw - localX;
            const penTop = localZ + hd;
            const penBottom = hd - localZ;
            const minPen = Math.min(penLeft, penRight, penTop, penBottom);
            if (minPen === penLeft) {
              localNx = -1;
              localNz = 0;
              pen = penLeft + PLAYER_RADIUS;
            } else if (minPen === penRight) {
              localNx = 1;
              localNz = 0;
              pen = penRight + PLAYER_RADIUS;
            } else if (minPen === penTop) {
              localNx = 0;
              localNz = -1;
              pen = penTop + PLAYER_RADIUS;
            } else {
              localNx = 0;
              localNz = 1;
              pen = penBottom + PLAYER_RADIUS;
            }
          }

          // Rotate normal back to world space
          const invCos = Math.cos(yaw);
          const invSin = Math.sin(yaw);
          const nx = localNx * invCos - localNz * invSin;
          const nz = localNx * invSin + localNz * invCos;

          body.x += nx * pen;
          body.z += nz * pen;

          const vn = body.vx * nx + body.vz * nz;
          if (vn < 0) {
            body.vx -= vn * nx;
            body.vz -= vn * nz;
          }
          pushed = true;
        }
      }

      if (!pushed) break;
    }
  }
}
