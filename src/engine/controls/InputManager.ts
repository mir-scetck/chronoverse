export interface MoveIntent {
  forward: number; // -1..1
  strafe: number; // -1..1
  sprint: boolean;
}

export class InputManager {
  private domElement: HTMLElement;
  private keys = new Set<string>();
  private dragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private lookDx = 0;
  private lookDy = 0;

  private blocked = false;
  private sensitivity = 1.0;
  private invertY = false;

  // External touch channels merged seamlessly
  private touchMoveX = 0;
  private touchMoveZ = 0;
  private touchSprint = false;

  private onInteract: () => void;
  private onPauseToggle: () => void;
  private onPointerLockChange?: (locked: boolean) => void;

  constructor(
    domElement: HTMLElement,
    callbacks: {
      onInteract: () => void;
      onPauseToggle: () => void;
      onPointerLockChange?: (locked: boolean) => void;
    },
  ) {
    this.domElement = domElement;
    this.onInteract = callbacks.onInteract;
    this.onPauseToggle = callbacks.onPauseToggle;
    this.onPointerLockChange = callbacks.onPointerLockChange;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    this.domElement.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  setBlocked(blocked: boolean): void {
    this.blocked = blocked;
    if (blocked) {
      this.keys.clear();
      this.dragging = false;
      this.lookDx = 0;
      this.lookDy = 0;
      if (document.pointerLockElement === this.domElement) {
        try {
          document.exitPointerLock();
        } catch {
          // ignore
        }
      }
    }
  }

  setPreferences(prefs: { mouseSensitivity: number; invertY: boolean }): void {
    this.sensitivity = prefs.mouseSensitivity;
    this.invertY = prefs.invertY;
  }

  setTouchInput(moveX: number, moveZ: number, sprint: boolean): void {
    this.touchMoveX = moveX;
    this.touchMoveZ = moveZ;
    this.touchSprint = sprint;
  }

  addTouchLookDelta(dx: number, dy: number): void {
    if (this.blocked) return;
    this.lookDx += dx;
    this.lookDy += dy;
  }

  requestPointerLock(): void {
    if (this.blocked) return;
    if (typeof this.domElement.requestPointerLock === 'function') {
      try {
        const res = this.domElement.requestPointerLock() as unknown;
        if (res && typeof (res as Promise<void>).catch === 'function') {
          (res as Promise<void>).catch(() => {});
        }
      } catch {
        // Fallback drag-to-look still active
      }
    }
  }

  isPointerLocked(): boolean {
    return document.pointerLockElement === this.domElement;
  }

  getMoveIntent(): MoveIntent {
    if (this.blocked) {
      return { forward: 0, strafe: 0, sprint: false };
    }
    let forward = 0;
    let strafe = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) strafe += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) strafe -= 1;

    forward = Math.max(-1, Math.min(1, forward + this.touchMoveZ));
    strafe = Math.max(-1, Math.min(1, strafe + this.touchMoveX));

    const mag = Math.hypot(forward, strafe);
    if (mag > 1) {
      forward /= mag;
      strafe /= mag;
    }

    const sprint =
      this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.touchSprint;

    return { forward, strafe, sprint };
  }

  consumeLookDelta(): { yawDelta: number; pitchDelta: number } {
    const scale = 0.0022 * this.sensitivity;
    const yawDelta = -this.lookDx * scale;
    const pitchSign = this.invertY ? 1 : -1;
    const pitchDelta = this.lookDy * scale * pitchSign;
    this.lookDx = 0;
    this.lookDy = 0;
    return { yawDelta, pitchDelta };
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    ) {
      return;
    }

    if (e.code === 'Escape') {
      if (!this.blocked) {
        this.onPauseToggle();
      }
      return;
    }

    if (this.blocked) return;

    if (e.code === 'KeyE') {
      if (!e.repeat) {
        this.onInteract();
      }
      return;
    }

    if (
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'Space'
    ) {
      e.preventDefault();
    }

    this.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private handleBlur = (): void => {
    this.keys.clear();
    this.dragging = false;
  };

  private handlePointerLockChange = (): void => {
    this.onPointerLockChange?.(document.pointerLockElement === this.domElement);
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (this.blocked || e.button !== 0) return;
    this.dragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    // Request pointer lock on direct canvas click unless inside touch device
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches) {
      this.requestPointerLock();
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (this.blocked) return;
    if (document.pointerLockElement === this.domElement) {
      this.lookDx += e.movementX;
      this.lookDy += e.movementY;
    } else if (this.dragging) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.lookDx += dx * 1.4;
      this.lookDy += dy * 1.4;
    }
  };

  private handleMouseUp = (): void => {
    this.dragging = false;
  };

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    this.domElement.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.keys.clear();
  }
}
