import type { Character, InteractiveObject, Location, World, WorldId } from '../../contracts';

export interface NearbySnapshot {
  currentLocation: Location | null;
  nearbyCharacters: Character[];
  nearbyObjects: InteractiveObject[];
}

export interface LocationTransition {
  exited: Location | null;
  entered: Location | null;
}

export class LocationTracker {
  private currentLocation: Location | null = null;
  private readonly hysteresisMeters = 1.0;

  reset(): void {
    this.currentLocation = null;
  }

  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  evaluate(
    world: World,
    px: number,
    pz: number,
    options?: { forceReset?: boolean },
  ): { snapshot: NearbySnapshot; transition: LocationTransition } {
    if (options?.forceReset) {
      const old = this.currentLocation;
      this.currentLocation = null;
      const next = this.pickLocation(world.locations, px, pz, null);
      this.currentLocation = next;
      return {
        snapshot: this.buildSnapshot(world, px, pz, next),
        transition: {
          exited: old && old.id !== next?.id ? old : null,
          entered: next && old?.id !== next.id ? next : null,
        },
      };
    }

    const prev = this.currentLocation;
    const next = this.pickLocation(world.locations, px, pz, prev);
    let exited: Location | null = null;
    let entered: Location | null = null;

    if (prev && (!next || next.id !== prev.id)) {
      exited = prev;
    }
    if (next && (!prev || prev.id !== next.id)) {
      entered = next;
    }

    this.currentLocation = next;
    return {
      snapshot: this.buildSnapshot(world, px, pz, next),
      transition: { exited, entered },
    };
  }

  private pickLocation(
    locations: Location[],
    px: number,
    pz: number,
    current: Location | null,
  ): Location | null {
    // Check strict containment first (pick smallest distance / radius ratio on overlap)
    let best: Location | null = null;
    let bestRatio = Infinity;

    for (const loc of locations) {
      const dist = Math.hypot(px - loc.center.x, pz - loc.center.z);
      if (dist <= loc.radius) {
        const ratio = dist / Math.max(0.01, loc.radius);
        if (ratio < bestRatio) {
          bestRatio = ratio;
          best = loc;
        }
      }
    }

    if (best) return best;

    // Hysteresis: remain in current location until leaving radius + 1m
    if (current) {
      const dist = Math.hypot(px - current.center.x, pz - current.center.z);
      if (dist <= current.radius + this.hysteresisMeters) {
        return current;
      }
    }

    return null;
  }

  private buildSnapshot(
    world: World,
    px: number,
    pz: number,
    currentLocation: Location | null,
  ): NearbySnapshot {
    const nearbyCharacters: Character[] = [];
    for (const ch of world.characters) {
      const d = Math.hypot(px - ch.placement.position.x, pz - ch.placement.position.z);
      if (d <= 6.0) {
        nearbyCharacters.push(ch);
      }
    }

    const nearbyObjects: InteractiveObject[] = [];
    for (const obj of world.objects) {
      const d = Math.hypot(px - obj.position.x, pz - obj.position.z);
      if (d <= obj.interactionRadius * 1.5) {
        nearbyObjects.push(obj);
      }
    }

    return {
      currentLocation,
      nearbyCharacters,
      nearbyObjects,
    };
  }
}

export function makeLocationEvents(
  worldId: WorldId,
  transition: LocationTransition,
): Array<{ type: 'location:exit' | 'location:enter'; locationId: string; worldId: WorldId; location?: Location }> {
  const events: Array<{
    type: 'location:exit' | 'location:enter';
    locationId: string;
    worldId: WorldId;
    location?: Location;
  }> = [];
  if (transition.exited) {
    events.push({ type: 'location:exit', worldId, locationId: transition.exited.id });
  }
  if (transition.entered) {
    events.push({
      type: 'location:enter',
      worldId,
      locationId: transition.entered.id,
      location: transition.entered,
    });
  }
  return events;
}
