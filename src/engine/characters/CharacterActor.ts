import * as THREE from 'three';
import type { Character, GestureName } from '../../contracts';
import type { ResourceTracker } from '../core/ResourceTracker';
import type { MaterialLibrary } from '../textures/proceduralTextures';

const _toPlayer = new THREE.Vector3();
const _forward = new THREE.Vector3();

export class CharacterActor {
  readonly data: Character;
  readonly root = new THREE.Group();
  readonly pickMesh: THREE.Mesh;

  private bodyPivot = new THREE.Group();
  private headPivot = new THREE.Group();
  private jawMesh: THREE.Mesh;
  private leftEyeLid: THREE.Mesh;
  private rightEyeLid: THREE.Mesh;
  private leftArmPivot = new THREE.Group();
  private rightArmPivot = new THREE.Group();

  private homeYaw: number;
  private currentYaw: number;
  private targetYaw: number;
  private dialogueActive = false;
  private returnTimer = 0;

  private speaking = false;
  private lipSyncTarget = 0;
  private lipSyncValue = 0;
  private lipSyncSilenceTimer = 0;

  private activeGesture: GestureName = 'none';
  private gestureTimer = 0;
  private gestureDuration = 1.4;

  private blinkTimer = 2.5;
  private blinkElapsed = -1;
  private elapsed = Math.random() * 10;

  constructor(
    character: Character,
    mats: MaterialLibrary,
    tracker: ResourceTracker,
  ) {
    this.data = character;
    const app = character.appearance;
    this.homeYaw = character.placement.rotation.y;
    this.currentYaw = this.homeYaw;
    this.targetYaw = this.homeYaw;

    this.root.name = `character:${character.id}`;
    this.root.position.set(
      character.placement.position.x,
      character.placement.position.y,
      character.placement.position.z,
    );
    this.root.rotation.y = this.homeYaw;
    this.root.scale.setScalar(app.scale);

    // Contact shadow disc
    const shadowGeo = tracker.trackGeometry(new THREE.CircleGeometry(0.55, 18));
    const shadowDisc = new THREE.Mesh(shadowGeo, mats.getContactShadowMaterial());
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.015;
    this.root.add(shadowDisc);

    this.root.add(this.bodyPivot);

    const robeMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.robeColor, roughness: 0.88, metalness: 0.02 }),
    );
    const cloakMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.cloakColor, roughness: 0.82, metalness: 0.04 }),
    );
    const sashMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.sashColor, roughness: 0.35, metalness: 0.65 }),
    );
    const skinMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.skinTone, roughness: 0.72, metalness: 0.0 }),
    );
    const turbanMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.turbanColor, roughness: 0.82, metalness: 0.03 }),
    );
    const beardMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: app.beardColor ?? '#241c18', roughness: 0.9, metalness: 0.0 }),
    );
    const eyeMat = tracker.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#141210', roughness: 0.2 }),
    );

    // Lower robe skirt (flared cylinder)
    const lowerRobe = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.24, 0.34, 0.92, 14)),
      robeMat,
    );
    lowerRobe.position.y = 0.46;
    this.bodyPivot.add(lowerRobe);

    // Upper torso & tunic
    const torso = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.23, 0.25, 0.56, 14)),
      robeMat,
    );
    torso.position.y = 1.18;
    this.bodyPivot.add(torso);

    // Ceremonial cloak mantle draped on shoulders
    const cloak = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.26, 0.35, 0.82, 12, 1, true, Math.PI * 0.22, Math.PI * 1.56)),
      cloakMat,
    );
    cloak.position.y = 1.05;
    cloak.rotation.y = Math.PI;
    this.bodyPivot.add(cloak);

    // Tiraz gold sash around waist
    const sash = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.255, 0.26, 0.13, 14)),
      sashMat,
    );
    sash.position.y = 0.94;
    this.bodyPivot.add(sash);

    // Articulated left & right arms
    const sleeveGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.085, 0.105, 0.52, 10));
    const handGeo = tracker.trackGeometry(new THREE.SphereGeometry(0.065, 10, 8));

    this.leftArmPivot.position.set(-0.28, 1.38, 0);
    const lSleeve = new THREE.Mesh(sleeveGeo, cloakMat);
    lSleeve.position.y = -0.24;
    const lHand = new THREE.Mesh(handGeo, skinMat);
    lHand.position.y = -0.52;
    this.leftArmPivot.add(lSleeve, lHand);
    this.bodyPivot.add(this.leftArmPivot);

    this.rightArmPivot.position.set(0.28, 1.38, 0);
    const rSleeve = new THREE.Mesh(sleeveGeo, cloakMat);
    rSleeve.position.y = -0.24;
    const rHand = new THREE.Mesh(handGeo, skinMat);
    rHand.position.y = -0.52;
    this.rightArmPivot.add(rSleeve, rHand);
    this.bodyPivot.add(this.rightArmPivot);

    // Head pivot
    this.headPivot.position.set(0, 1.54, 0);
    this.bodyPivot.add(this.headPivot);

    const neck = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 10)),
      skinMat,
    );
    neck.position.y = 0.02;
    this.headPivot.add(neck);

    const skull = new THREE.Mesh(
      tracker.trackGeometry(new THREE.SphereGeometry(0.145, 16, 14)),
      skinMat,
    );
    skull.scale.set(0.95, 1.08, 1.0);
    skull.position.y = 0.16;
    this.headPivot.add(skull);

    // Eyes & eyelids (blink)
    const eyeGeo = tracker.trackGeometry(new THREE.SphereGeometry(0.018, 8, 8));
    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.052, 0.18, 0.128);
    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    rEye.position.set(0.052, 0.18, 0.128);
    this.headPivot.add(lEye, rEye);

    const lidGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.042, 0.025, 0.02));
    this.leftEyeLid = new THREE.Mesh(lidGeo, skinMat);
    this.leftEyeLid.position.set(-0.052, 0.195, 0.132);
    this.leftEyeLid.scale.y = 0.1;
    this.rightEyeLid = new THREE.Mesh(lidGeo, skinMat);
    this.rightEyeLid.position.set(0.052, 0.195, 0.132);
    this.rightEyeLid.scale.y = 0.1;
    this.headPivot.add(this.leftEyeLid, this.rightEyeLid);

    // Beard & jaw (lip-sync driven)
    const jawGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.11, 0.09, 0.08));
    this.jawMesh = new THREE.Mesh(jawGeo, beardMat);
    this.jawMesh.position.set(0, 0.075, 0.088);
    this.headPivot.add(this.jawMesh);

    // Folded Abbasid Turban
    const turbanBase = new THREE.Mesh(
      tracker.trackGeometry(new THREE.TorusGeometry(0.15, 0.055, 10, 20)),
      turbanMat,
    );
    turbanBase.rotation.x = Math.PI * 0.5;
    turbanBase.position.y = 0.255;
    this.headPivot.add(turbanBase);

    const turbanCrown = new THREE.Mesh(
      tracker.trackGeometry(new THREE.SphereGeometry(0.155, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55)),
      turbanMat,
    );
    turbanCrown.position.y = 0.255;
    this.headPivot.add(turbanCrown);

    if (character.id === 'harun-al-rashid') {
      const band = new THREE.Mesh(
        tracker.trackGeometry(new THREE.TorusGeometry(0.165, 0.015, 8, 20)),
        sashMat,
      );
      band.rotation.x = Math.PI * 0.5;
      band.position.y = 0.26;
      this.headPivot.add(band);
    }

    this.root.traverse((child) => {
      if (child instanceof THREE.Mesh && child !== shadowDisc) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Dedicated raycast pick capsule on layer 1 (transparent opacity:0 so Three Raycaster never skips it)
    const pickGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.65, 0.65, 2.0, 10));
    const pickMat = tracker.trackMaterial(
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    this.pickMesh = new THREE.Mesh(pickGeo, pickMat);
    this.pickMesh.position.y = 1.0;
    this.pickMesh.layers.set(1);
    this.pickMesh.userData = {
      targetType: 'character',
      targetId: character.id,
      prompt: character.prompt,
      interactionRadius: character.interactionRadius,
    };
    this.root.add(this.pickMesh);

    tracker.trackObject(this.root);
  }

  startDialogue(playerPos: THREE.Vector3): void {
    this.dialogueActive = true;
    this.returnTimer = 0;
    const dx = playerPos.x - this.root.position.x;
    const dz = playerPos.z - this.root.position.z;
    this.targetYaw = Math.atan2(dx, dz);
  }

  endDialogue(): void {
    this.dialogueActive = false;
    this.returnTimer = 3.0;
  }

  setSpeaking(speaking: boolean): void {
    this.speaking = speaking;
    if (!speaking) {
      this.lipSyncSilenceTimer = 0.1;
    }
  }

  pushLipSync(open: number): void {
    this.lipSyncTarget = THREE.MathUtils.clamp(open, 0, 1);
    this.lipSyncSilenceTimer = 0.14;
  }

  playGesture(gesture: GestureName): void {
    this.activeGesture = gesture;
    this.gestureTimer = 0;
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    this.elapsed += dt;

    // Return to home facing 3s after dialogue ends
    if (!this.dialogueActive && this.returnTimer > 0) {
      this.returnTimer -= dt;
      if (this.returnTimer <= 0) {
        this.targetYaw = this.homeYaw;
      }
    }

    // Smooth yaw turn
    let diff = this.targetYaw - this.currentYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.currentYaw += diff * (1 - Math.exp(-6 * dt));
    this.root.rotation.y = this.currentYaw;

    // Breathing & idle sway
    const breath = 1 + Math.sin(this.elapsed * 2.1) * 0.006;
    this.bodyPivot.scale.set(1, breath, 1);
    this.bodyPivot.rotation.z = Math.sin(this.elapsed * 0.85) * 0.014;

    // Gaze tracking within 5m and ±70° frontal cone
    _toPlayer.subVectors(playerPos, this.root.position);
    const dist = Math.hypot(_toPlayer.x, _toPlayer.z);
    let desiredHeadYaw = 0;
    let desiredHeadPitch = 0;

    if (dist < 5.0 && dist > 0.3) {
      _forward.set(Math.sin(this.currentYaw), 0, Math.cos(this.currentYaw));
      const worldAngle = Math.atan2(_toPlayer.x, _toPlayer.z);
      let relYaw = worldAngle - this.currentYaw;
      while (relYaw > Math.PI) relYaw -= Math.PI * 2;
      while (relYaw < -Math.PI) relYaw += Math.PI * 2;

      if (Math.abs(relYaw) <= THREE.MathUtils.degToRad(70)) {
        desiredHeadYaw = THREE.MathUtils.clamp(
          relYaw,
          -THREE.MathUtils.degToRad(60),
          THREE.MathUtils.degToRad(60),
        );
        const dy = playerPos.y + 1.55 - (this.root.position.y + 1.65);
        desiredHeadPitch = THREE.MathUtils.clamp(
          -Math.atan2(dy, dist),
          -THREE.MathUtils.degToRad(25),
          THREE.MathUtils.degToRad(25),
        );
      }
    }

    const headDamp = 1 - Math.exp(-6 * dt);
    this.headPivot.rotation.y = THREE.MathUtils.lerp(this.headPivot.rotation.y, desiredHeadYaw, headDamp);
    this.headPivot.rotation.x = THREE.MathUtils.lerp(this.headPivot.rotation.x, desiredHeadPitch, headDamp);

    // Blinking every 2-6s for ~120ms
    if (this.blinkElapsed >= 0) {
      this.blinkElapsed += dt;
      const blinkPhase = Math.sin((this.blinkElapsed / 0.12) * Math.PI);
      const lidScale = this.blinkElapsed <= 0.12 ? 0.1 + Math.max(0, blinkPhase) * 1.4 : 0.1;
      this.leftEyeLid.scale.y = lidScale;
      this.rightEyeLid.scale.y = lidScale;
      if (this.blinkElapsed > 0.13) {
        this.blinkElapsed = -1;
        this.blinkTimer = 2.2 + Math.random() * 3.6;
      }
    } else {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.blinkElapsed = 0;
      }
    }

    // Lip-sync jaw driver
    let jawTarget = 0;
    if (this.lipSyncSilenceTimer > 0 && this.lipSyncTarget > 0.02) {
      jawTarget = this.lipSyncTarget;
      this.lipSyncSilenceTimer -= dt;
    } else if (this.speaking) {
      jawTarget = 0.18 + 0.55 * Math.abs(Math.sin(this.elapsed * 9.5) * Math.cos(this.elapsed * 3.7));
    }
    this.lipSyncValue = THREE.MathUtils.lerp(this.lipSyncValue, jawTarget, 1 - Math.exp(-16 * dt));
    this.jawMesh.position.y = 0.075 - this.lipSyncValue * 0.024;

    // Procedural gesture animation
    let lArmX = 0.06;
    let lArmZ = -0.08;
    let rArmX = 0.06;
    let rArmZ = 0.08;

    if (this.activeGesture !== 'none') {
      this.gestureTimer += dt;
      const p = Math.min(1, this.gestureTimer / this.gestureDuration);
      const env = Math.sin(p * Math.PI);

      switch (this.activeGesture) {
        case 'greet':
        case 'welcome':
          rArmX = -0.95 * env;
          rArmZ = 0.35 * env;
          lArmX = -0.35 * env;
          break;
        case 'explain':
          rArmX = -0.65 * env + Math.sin(p * Math.PI * 3) * 0.15;
          lArmX = -0.55 * env;
          break;
        case 'emphasize':
          rArmX = -1.1 * env;
          break;
        case 'point':
          rArmX = -1.35 * env;
          rArmZ = 0.15 * env;
          break;
        case 'think':
          rArmX = -1.25 * env;
          rArmZ = -0.25 * env;
          this.headPivot.rotation.x += 0.14 * env;
          break;
        case 'bow':
        case 'sad-sigh':
          this.bodyPivot.rotation.x = 0.18 * env;
          break;
        default:
          break;
      }

      if (this.gestureTimer >= this.gestureDuration) {
        this.activeGesture = 'none';
        this.bodyPivot.rotation.x = 0;
      }
    } else {
      this.bodyPivot.rotation.x = THREE.MathUtils.lerp(this.bodyPivot.rotation.x, 0, 1 - Math.exp(-6 * dt));
      if (this.speaking) {
        rArmX = -0.35 + Math.sin(this.elapsed * 3.5) * 0.18;
        lArmX = -0.22 + Math.cos(this.elapsed * 2.8) * 0.12;
      }
    }

    const armDamp = 1 - Math.exp(-9 * dt);
    this.leftArmPivot.rotation.x = THREE.MathUtils.lerp(this.leftArmPivot.rotation.x, lArmX, armDamp);
    this.leftArmPivot.rotation.z = THREE.MathUtils.lerp(this.leftArmPivot.rotation.z, lArmZ, armDamp);
    this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(this.rightArmPivot.rotation.x, rArmX, armDamp);
    this.rightArmPivot.rotation.z = THREE.MathUtils.lerp(this.rightArmPivot.rotation.z, rArmZ, armDamp);
  }
}
