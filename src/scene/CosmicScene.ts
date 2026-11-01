import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BlackHoleSystem } from './BlackHole';
import { CosmicEnvironment } from './Environment';
import { CosmicTerrain } from './Terrain';
import { CameraPreset, RealmType, TelemetryData } from '../types/cosmic';
import { cosmicAudio } from '../audio/CosmicAudio';

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'horizon',
    name: 'Horizon View',
    description: 'Ground-level cinematic framing looking past the settlement into the event horizon',
    position: [0, 2.5, 12],
    target: [0, 9.5, -42],
    fov: 46,
  },
  {
    id: 'orbit',
    name: 'Orbital Vista',
    description: 'High-altitude panoramic view of the accretion disk and lensed spacetime',
    position: [24, 28, 20],
    target: [0, 14, -42],
    fov: 50,
  },
  {
    id: 'proximity',
    name: 'Photon Sphere',
    description: 'Close-proximity trajectory near the innermost stable circular orbit',
    position: [0, 16, -18],
    target: [0, 16, -42],
    fov: 54,
  },
  {
    id: 'slice',
    name: 'Accretion Plane',
    description: 'Edge-on trajectory piercing through relativistic swirling plasma',
    position: [-36, 16.0, -42],
    target: [0, 16, -42],
    fov: 48,
  },
  {
    id: 'zenith',
    name: 'Cosmic Zenith',
    description: 'Dramatic low-angle view looking directly upward at the curving halo',
    position: [0, 0.8, -4],
    target: [0, 20, -42],
    fov: 60,
  },
];

export class CosmicSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Subsystems
  public blackHole: BlackHoleSystem;
  public environment: CosmicEnvironment;
  public terrain: CosmicTerrain;

  // Camera animation & controls
  private cameraPosTarget: THREE.Vector3;
  private cameraLookTarget: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private targetFov: number = 44;

  // User input interaction
  private isPointerDown: boolean = false;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;
  private sphericalCoords: THREE.Spherical;
  private pinchDistance: number = 0;
  private manualOrbitOffset: THREE.Vector2 = new THREE.Vector2(0, 0);
  private manualOrbitTarget: THREE.Vector2 = new THREE.Vector2(0, 0);

  // Intro sequence
  private isIntroPlaying: boolean = false;
  private introProgress: number = 1.0;
  private introDuration: number = 7.0; // 7 seconds

  // Loop & performance pacing
  private frameId: number = 0;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;
  private isPaused: boolean = false;

  // Telemetry
  private fpsCounter: number = 60;
  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private onTelemetryUpdate?: (data: TelemetryData) => void;

  constructor(container: HTMLElement, onTelemetry?: (data: TelemetryData) => void) {
    this.container = container;
    this.onTelemetryUpdate = onTelemetry;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Scene & Renderer setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010103);
    this.scene.fog = new THREE.FogExp2(0x010103, 0.0075);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    this.cameraPosTarget = new THREE.Vector3(0, 2.5, 12);
    this.cameraLookTarget = new THREE.Vector3(0, 9.5, -42);
    this.currentLookAt = this.cameraLookTarget.clone();

    // Start directly at cinematic ground horizon view
    this.camera.position.set(0, 2.5, 12);
    this.camera.lookAt(this.currentLookAt);

    this.sphericalCoords = new THREE.Spherical();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Studio Reflection Environment Map
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('PMREM environment generation failed', e);
    }

    // 4. Subsystem initialization
    this.environment = new CosmicEnvironment(this.scene);
    this.blackHole = new BlackHoleSystem(this.scene);
    this.terrain = new CosmicTerrain(this.scene);

    // 5. Setup event handlers
    this.bindEvents();

    // 6. Start Render Loop
    this.startLoop();
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });

    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isPointerDown = true;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    // Interrupt cinematic intro if user interacts
    if (this.isIntroPlaying) {
      this.isIntroPlaying = false;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.pointerStartX;
    const dy = e.clientY - this.pointerStartY;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    this.manualOrbitTarget.x += dx * 0.003;
    this.manualOrbitTarget.y = THREE.MathUtils.clamp(
      this.manualOrbitTarget.y + dy * 0.003,
      -0.6,
      0.6
    );
  };

  private onMouseUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.isIntroPlaying) this.isIntroPlaying = false;

    // Smooth focal zoom
    const zoomDelta = e.deltaY * 0.03;
    this.targetFov = THREE.MathUtils.clamp(this.targetFov + zoomDelta, 22, 75);
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isPointerDown = true;
      this.pointerStartX = e.touches[0].clientX;
      this.pointerStartY = e.touches[0].clientY;
      if (this.isIntroPlaying) this.isIntroPlaying = false;
    } else if (e.touches.length === 2) {
      // Pinch gesture
      this.isPointerDown = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.pinchDistance = Math.hypot(dx, dy);
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && this.isPointerDown) {
      const dx = e.touches[0].clientX - this.pointerStartX;
      const dy = e.touches[0].clientY - this.pointerStartY;
      this.pointerStartX = e.touches[0].clientX;
      this.pointerStartY = e.touches[0].clientY;

      this.manualOrbitTarget.x += dx * 0.004;
      this.manualOrbitTarget.y = THREE.MathUtils.clamp(
        this.manualOrbitTarget.y + dy * 0.004,
        -0.6,
        0.6
      );
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const diff = this.pinchDistance - dist;
      this.pinchDistance = dist;
      this.targetFov = THREE.MathUtils.clamp(this.targetFov + diff * 0.1, 22, 75);
    }
  };

  private onTouchEnd = () => {
    this.isPointerDown = false;
  };

  public applyPreset(presetId: string) {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    this.isIntroPlaying = false;
    this.cameraPosTarget.set(...preset.position);
    this.cameraLookTarget.set(...preset.target);
    this.targetFov = preset.fov;
    this.manualOrbitTarget.set(0, 0);
  }

  public setFocalLength(mm: number) {
    // Convert 35mm equivalent focal length to vertical FOV
    // FOV = 2 * atan(frame_height / (2 * focal_length)) * (180 / PI), frame height ~ 24mm
    const fov = 2 * Math.atan(24 / (2 * mm)) * (180 / Math.PI);
    this.targetFov = THREE.MathUtils.clamp(fov, 18, 85);
  }

  public getFocalLength(): number {
    // Inverse conversion to mm
    const rad = (this.camera.fov * Math.PI) / 360;
    return Math.round(12 / Math.tan(rad));
  }

  public setRealm(realm: RealmType) {
    this.blackHole.setRealm(realm);
    this.environment.setRealm(realm);
    this.terrain.setRealm(realm);
    cosmicAudio.setRealm(realm);
  }

  public resetCamera() {
    this.applyPreset('horizon');
  }

  public restartIntro() {
    this.introProgress = 0;
    this.isIntroPlaying = true;
    this.camera.position.set(0, 50, 70);
    this.blackHole.setBrightness(0.01);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public isCinematicActive(): boolean {
    return this.isIntroPlaying;
  }

  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsedTime = this.clock.getElapsedTime();

      if (!this.isPaused) {
        // Intro Cinematic progression
        if (this.isIntroPlaying) {
          this.introProgress += delta / this.introDuration;
          if (this.introProgress >= 1.0) {
            this.introProgress = 1.0;
            this.isIntroPlaying = false;
          }

          // Stage 1 & 2: Descend smoothly from high orbit
          const t = this.introProgress;
          // Smooth ease-out cubic
          const easeT = 1 - Math.pow(1 - t, 3);

          const startPos = new THREE.Vector3(0, 50, 70);
          const endPos = new THREE.Vector3(0, 2.8, 14);
          this.cameraPosTarget.lerpVectors(startPos, endPos, easeT);

          // Black hole ignition brightness curve
          const igniteBrightness = THREE.MathUtils.smoothstep(t, 0.15, 0.7) * 1.25;
          this.blackHole.setBrightness(igniteBrightness);
        }

        // Damped user manual orbit
        this.manualOrbitOffset.x = THREE.MathUtils.damp(
          this.manualOrbitOffset.x,
          this.manualOrbitTarget.x,
          4.0,
          delta
        );
        this.manualOrbitOffset.y = THREE.MathUtils.damp(
          this.manualOrbitOffset.y,
          this.manualOrbitTarget.y,
          4.0,
          delta
        );

        // Smooth camera damping
        const effectivePos = this.cameraPosTarget.clone();
        // Add subtle manual orbit offset around target
        effectivePos.x += this.manualOrbitOffset.x * 12.0;
        effectivePos.y += this.manualOrbitOffset.y * 6.0;

        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, effectivePos.x, 3.0, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, effectivePos.y, 3.0, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, effectivePos.z, 3.0, delta);

        this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, this.cameraLookTarget.x, 3.0, delta);
        this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, this.cameraLookTarget.y, 3.0, delta);
        this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, this.cameraLookTarget.z, 3.0, delta);

        this.camera.lookAt(this.currentLookAt);

        // Smooth FOV zoom
        this.camera.fov = THREE.MathUtils.damp(this.camera.fov, this.targetFov, 4.0, delta);
        this.camera.updateProjectionMatrix();

        // Update subsystems
        this.blackHole.update(delta, elapsedTime);
        this.environment.update(delta, elapsedTime);
        this.terrain.update(delta, elapsedTime);

        // Proximity audio calculation
        const distToHole = this.camera.position.distanceTo(this.blackHole.group.position);
        cosmicAudio.updateProximityRumble(distToHole);

        // Telemetry calculation
        this.frameCount++;
        if (elapsedTime - this.lastFpsTime >= 0.5) {
          this.fpsCounter = Math.round((this.frameCount * 1.0) / (elapsedTime - this.lastFpsTime));
          this.frameCount = 0;
          this.lastFpsTime = elapsedTime;

          if (this.onTelemetryUpdate) {
            const alt = parseFloat(Math.max(0.1, this.camera.position.y).toFixed(2));
            const pitch = parseFloat(((this.camera.rotation.x * 180) / Math.PI).toFixed(1));
            // General relativistic lore calculation
            const rs = 7.0; // Schwarzschild radius in our scene scale
            const r = Math.max(rs + 0.1, distToHole);
            const gamma = parseFloat((1 / Math.sqrt(Math.max(0.01, 1 - rs / r))).toFixed(2));

            this.onTelemetryUpdate({
              fps: this.fpsCounter,
              altitude: alt,
              horizonAngle: Math.abs(pitch),
              relativityGamma: gamma,
              timeDilationRatio: gamma > 2.0 ? '1 HR = 7 YRS' : '1 HR = 1.4 YRS',
              eventHorizonRadius: '10.4 M-KM',
              focalLength: this.getFocalLength(),
            });
          }
        }
      }

      this.renderer.render(this.scene, this.camera);

      this.frameId = requestAnimationFrame(tick);
    };

    this.frameId = requestAnimationFrame(tick);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    this.blackHole.dispose();
    this.environment.dispose();
    this.terrain.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
