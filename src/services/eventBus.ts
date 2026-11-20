import type { WorldEventMap } from '../contracts';

type Listener<T> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<keyof WorldEventMap, Set<Listener<never>>>();

  on<K extends keyof WorldEventMap>(
    event: K,
    listener: Listener<WorldEventMap[K]>,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<never>);
    return () => {
      this.off(event, listener);
    };
  }

  off<K extends keyof WorldEventMap>(
    event: K,
    listener: Listener<WorldEventMap[K]>,
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(listener as Listener<never>);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  once<K extends keyof WorldEventMap>(
    event: K,
    listener: Listener<WorldEventMap[K]>,
  ): () => void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe();
      listener(payload);
    });
    return unsubscribe;
  }

  emit<K extends keyof WorldEventMap>(event: K, payload: WorldEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of Array.from(set)) {
      (listener as Listener<WorldEventMap[K]>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();
export { TypedEventBus };
