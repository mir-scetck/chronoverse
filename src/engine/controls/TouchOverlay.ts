import type { InputManager } from './InputManager';

export class TouchOverlay {
  private root: HTMLDivElement | null = null;
  private interactBtn: HTMLButtonElement | null = null;
  private sprintBtn: HTMLButtonElement | null = null;
  private rotateHint: HTMLDivElement | null = null;

  private joyPointerId: number | null = null;
  private joyCenterX = 0;
  private joyCenterY = 0;
  private lookPointerId: number | null = null;
  private lookLastX = 0;
  private lookLastY = 0;
  private sprintActive = false;

  private thumbEl: HTMLDivElement | null = null;
  private input: InputManager;
  private onInteract: () => void;

  constructor(
    container: HTMLElement,
    input: InputManager,
    onInteract: () => void,
  ) {
    this.input = input;
    this.onInteract = onInteract;

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
    if (!isTouch) return;

    const root = document.createElement('div');
    root.className = 'cv-touch-overlay';
    root.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:22;user-select:none;-webkit-user-select:none;';

    // Left virtual joystick (120px base, 52px thumb)
    const joyBase = document.createElement('div');
    joyBase.style.cssText =
      'position:absolute;left:24px;bottom:24px;width:120px;height:120px;border-radius:9999px;border:1px solid rgba(201,163,83,0.45);background:rgba(11,11,13,0.52);pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;';

    const thumb = document.createElement('div');
    thumb.style.cssText =
      'width:52px;height:52px;border-radius:9999px;background:rgba(201,163,83,0.72);border:1px solid #f2ede2;transform:translate(0px,0px);transition:transform 40ms linear;pointer-events:none;';
    joyBase.appendChild(thumb);
    this.thumbEl = thumb;

    // Right look capture area
    const lookZone = document.createElement('div');
    lookZone.style.cssText =
      'position:absolute;right:0;top:15%;bottom:130px;width:54%;pointer-events:auto;touch-action:none;';

    // Right-bottom sprint & interact buttons (>=48px)
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText =
      'position:absolute;right:24px;bottom:24px;display:flex;gap:12px;align-items:center;pointer-events:auto;';

    const sprintBtn = document.createElement('button');
    sprintBtn.type = 'button';
    sprintBtn.textContent = 'Run';
    sprintBtn.style.cssText =
      'min-width:52px;min-height:52px;padding:0 14px;border-radius:8px;border:1px solid rgba(201,163,83,0.45);background:rgba(21,21,23,0.85);color:#f2ede2;font-size:13px;font-weight:600;touch-action:manipulation;';
    sprintBtn.addEventListener('click', this.handleSprintToggle);
    this.sprintBtn = sprintBtn;

    const interactBtn = document.createElement('button');
    interactBtn.type = 'button';
    interactBtn.textContent = 'Interact';
    interactBtn.style.cssText =
      'min-width:64px;min-height:56px;padding:0 16px;border-radius:8px;border:1px solid #c9a353;background:rgba(201,163,83,0.92);color:#0b0b0d;font-size:14px;font-weight:700;touch-action:manipulation;opacity:0.45;';
    interactBtn.addEventListener('click', this.handleInteractClick);
    this.interactBtn = interactBtn;

    btnGroup.append(sprintBtn, interactBtn);

    // Subtle portrait rotate notice
    const rotateHint = document.createElement('div');
    rotateHint.style.cssText =
      'position:absolute;top:12px;left:50%;transform:translateX(-50%);padding:6px 12px;border-radius:6px;background:rgba(11,11,13,0.86);border:1px solid rgba(201,163,83,0.3);color:#c2baaa;font-size:12px;display:none;pointer-events:none;white-space:nowrap;';
    rotateHint.textContent = 'Rotate to landscape for a wider view';
    this.rotateHint = rotateHint;

    root.append(joyBase, lookZone, btnGroup, rotateHint);
    container.appendChild(root);
    this.root = root;

    joyBase.addEventListener('pointerdown', this.onJoyDown);
    joyBase.addEventListener('pointermove', this.onJoyMove);
    joyBase.addEventListener('pointerup', this.onJoyUp);
    joyBase.addEventListener('pointercancel', this.onJoyUp);

    lookZone.addEventListener('pointerdown', this.onLookDown);
    lookZone.addEventListener('pointermove', this.onLookMove);
    lookZone.addEventListener('pointerup', this.onLookUp);
    lookZone.addEventListener('pointercancel', this.onLookUp);

    window.addEventListener('resize', this.updateOrientationHint);
    this.updateOrientationHint();
  }

  setVisible(visible: boolean): void {
    if (!this.root) return;
    this.root.style.display = visible ? 'block' : 'none';
  }

  setInteractTarget(label: string | null): void {
    if (!this.interactBtn) return;
    if (label) {
      this.interactBtn.style.opacity = '1';
      this.interactBtn.textContent = label.length > 14 ? 'Inspect' : label;
    } else {
      this.interactBtn.style.opacity = '0.42';
      this.interactBtn.textContent = 'Interact';
    }
  }

  private updateOrientationHint = (): void => {
    if (!this.rotateHint) return;
    const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
    this.rotateHint.style.display = isPortrait ? 'block' : 'none';
  };

  private handleSprintToggle = (): void => {
    this.sprintActive = !this.sprintActive;
    if (this.sprintBtn) {
      this.sprintBtn.style.background = this.sprintActive
        ? 'rgba(201,163,83,0.85)'
        : 'rgba(21,21,23,0.85)';
      this.sprintBtn.style.color = this.sprintActive ? '#0b0b0d' : '#f2ede2';
    }
  };

  private handleInteractClick = (): void => {
    this.onInteract();
  };

  private onJoyDown = (e: PointerEvent): void => {
    if (this.joyPointerId !== null) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.joyPointerId = e.pointerId;
    this.joyCenterX = rect.left + rect.width * 0.5;
    this.joyCenterY = rect.top + rect.height * 0.5;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.updateJoystick(e.clientX, e.clientY);
  };

  private onJoyMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.joyPointerId) return;
    this.updateJoystick(e.clientX, e.clientY);
  };

  private onJoyUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.joyPointerId) return;
    this.joyPointerId = null;
    if (this.thumbEl) {
      this.thumbEl.style.transform = 'translate(0px, 0px)';
    }
    this.input.setTouchInput(0, 0, this.sprintActive);
  };

  private updateJoystick(clientX: number, clientY: number): void {
    const maxRadius = 42;
    const dx = clientX - this.joyCenterX;
    const dy = clientY - this.joyCenterY;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const visualX = Math.cos(angle) * clamped;
    const visualY = Math.sin(angle) * clamped;
    if (this.thumbEl) {
      this.thumbEl.style.transform = `translate(${visualX}px, ${visualY}px)`;
    }

    const norm = clamped / maxRadius;
    if (norm < 0.12) {
      this.input.setTouchInput(0, 0, this.sprintActive);
      return;
    }

    // Smooth response curve x^1.3 after 12% dead zone
    const mag = Math.pow((norm - 0.12) / 0.88, 1.3);
    const moveX = Math.cos(angle) * mag;
    const moveZ = -Math.sin(angle) * mag;
    this.input.setTouchInput(moveX, moveZ, this.sprintActive);
  }

  private onLookDown = (e: PointerEvent): void => {
    if (this.lookPointerId !== null) return;
    this.lookPointerId = e.pointerId;
    this.lookLastX = e.clientX;
    this.lookLastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  private onLookMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.lookPointerId) return;
    const dx = e.clientX - this.lookLastX;
    const dy = e.clientY - this.lookLastY;
    this.lookLastX = e.clientX;
    this.lookLastY = e.clientY;
    this.input.addTouchLookDelta(dx * 1.6, dy * 1.6);
  };

  private onLookUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.lookPointerId) return;
    this.lookPointerId = null;
  };

  dispose(): void {
    window.removeEventListener('resize', this.updateOrientationHint);
    if (this.root && this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
    this.root = null;
  }
}
