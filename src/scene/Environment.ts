import * as THREE from 'three';
import { RealmType } from '../types/cosmic';

/**
 * Cosmic Environment:
 * - Depth-layered starfield with gravitational distortion and twinkling
 * - Procedural galactic nebula sky background
 * - Horizon dust particles and atmospheric motes drifting across the plain
 * - Dynamic horizon lighting & fog matching the active realm
 */
export class CosmicEnvironment {
  public group: THREE.Group;

  private starfield!: THREE.Points;
  private nebulaMesh!: THREE.Mesh;
  private dustPoints!: THREE.Points;
  private dustPositions!: Float32Array;
  private dustVelocities!: Float32Array;

  // Shader materials
  private starMaterial!: THREE.ShaderMaterial;
  private nebulaMaterial!: THREE.ShaderMaterial;
  private dustMaterial!: THREE.ShaderMaterial;

  // Lights
  public keyLight!: THREE.DirectionalLight;
  public fillLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public horizonLight!: THREE.PointLight;

  private targetRealm: RealmType = 'aurum';
  private transitionProgress: number = 0.0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.setupLights(scene);
    this.createNebulaDome();
    this.createStarfield();
    this.createCosmicDust();
  }

  private setupLights(scene: THREE.Scene) {
    // Key light from the glowing black hole accretion disk
    this.keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    this.keyLight.position.set(0, 20, -45);
    scene.add(this.keyLight);

    // Subtle fill light for foreground visibility
    this.fillLight = new THREE.DirectionalLight(0x443366, 0.6);
    this.fillLight.position.set(20, 10, 20);
    scene.add(this.fillLight);

    // Cool celestial hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0x221133, 0x050508, 0.8);
    scene.add(this.hemiLight);

    // Warm/Violet horizon ground glow
    this.horizonLight = new THREE.PointLight(0xf59e0b, 3.5, 90, 1.2);
    this.horizonLight.position.set(0, 2.0, -15);
    scene.add(this.horizonLight);
  }

  private createNebulaDome() {
    const geo = new THREE.SphereGeometry(280, 48, 48);
    // Invert geometry to view from inside
    geo.scale(-1, 1, 1);

    this.nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTransition: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uTransition;
        varying vec3 vWorldPosition;

        // Simple hash & noise for deep space nebula
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                         mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                         mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        float fbm(vec3 p) {
          float v = 0.0;
          v += 0.5 * noise(p); p *= 2.01;
          v += 0.25 * noise(p); p *= 2.02;
          v += 0.125 * noise(p);
          return v;
        }

        void main() {
          vec3 dir = normalize(vWorldPosition);
          
          // Cosmic dust lane along the celestial plane
          float galacticBand = pow(max(0.0, 1.0 - abs(dir.y * 1.8)), 2.5);
          float nebulaClouds = fbm(dir * 3.5 + vec3(0.0, uTime * 0.015, 0.0));

          // Base void color: deep black obsidian
          vec3 baseVoid = vec3(0.005, 0.005, 0.012);

          // Aurum Nebula: Dark amber, burnt sienna, and cosmic charcoal
          vec3 aurumNebula = mix(baseVoid, vec3(0.18, 0.08, 0.02), nebulaClouds * galacticBand);
          aurumNebula += vec3(0.12, 0.05, 0.01) * pow(nebulaClouds, 2.0);

          // Viola Nebula: Deep cosmic indigo, violet clouds, and midnight magenta
          vec3 violaNebula = mix(baseVoid, vec3(0.08, 0.03, 0.18), nebulaClouds * galacticBand);
          violaNebula += vec3(0.10, 0.04, 0.22) * pow(nebulaClouds, 2.0);

          vec3 finalColor = mix(aurumNebula, violaNebula, uTransition);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.nebulaMesh = new THREE.Mesh(geo, this.nebulaMaterial);
    this.group.add(this.nebulaMesh);
  }

  private createStarfield() {
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const seeds = new Float32Array(starCount);

    const c1 = new THREE.Color(0xffffff); // pure white
    const c2 = new THREE.Color(0xffddaa); // golden dwarf
    const c3 = new THREE.Color(0xaaccff); // blue giant
    const c4 = new THREE.Color(0xddaaff); // violet star

    for (let i = 0; i < starCount; i++) {
      // Distribute on sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 240.0 + Math.random() * 30.0;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(0.0, r * Math.cos(phi)); // Keep mostly in upper hemisphere
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      const roll = Math.random();
      let col = c1;
      if (roll < 0.35) col = c2;
      else if (roll < 0.65) col = c3;
      else if (roll < 0.85) col = c4;

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2.5 + 1.2;
      seeds[i] = Math.random() * 100.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

    this.starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uStreakStrength: { value: 0.6 },
      },
      vertexShader: `
        attribute float size;
        attribute float seed;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;

        void main() {
          vColor = color;
          // Twinkle formula
          float twinkle = sin(uTime * 2.5 + seed) * 0.35 + 0.65;
          vTwinkle = twinkle;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(2.0, size * (420.0 / -mvPosition.z) * twinkle);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Soft stellar disk with diffraction spike cross
          float core = pow(1.0 - dist * 2.0, 2.5);
          float crossGlow = max(0.0, 1.0 - abs(coord.x) * 16.0) * max(0.0, 1.0 - abs(coord.y) * 4.0) +
                            max(0.0, 1.0 - abs(coord.y) * 16.0) * max(0.0, 1.0 - abs(coord.x) * 4.0);
          
          float totalAlpha = core + crossGlow * 0.4;
          gl_FragColor = vec4(vColor * vTwinkle, totalAlpha);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(geometry, this.starMaterial);
    this.group.add(this.starfield);
  }

  private createCosmicDust() {
    const count = 1800;
    const geometry = new THREE.BufferGeometry();
    this.dustPositions = new Float32Array(count * 3);
    this.dustVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Dust spans across the terrain horizon (x: -50 to 50, y: 0.2 to 14, z: -40 to 20)
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 100;
      this.dustPositions[i * 3 + 1] = Math.random() * 14 + 0.2;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Velocity: drifting horizontally toward the right/center with slight elevation change
      this.dustVelocities[i * 3] = (Math.random() * 0.6 + 0.3); // horizontal wind
      this.dustVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      this.dustVelocities[i * 3 + 2] = -(Math.random() * 0.3 + 0.1); // pulled gently towards black hole
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));

    this.dustMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTransition: { value: 0.0 },
      },
      vertexShader: `
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(mvPosition.xyz);
          gl_PointSize = clamp(25.0 / dist, 1.5, 8.0);
          vAlpha = clamp(1.0 - (dist / 70.0), 0.1, 0.9);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTransition;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float d = length(coord);
          if (d > 0.5) discard;

          float intensity = pow(1.0 - d * 2.0, 1.8);
          vec3 aurumColor = vec3(1.0, 0.8, 0.4);
          vec3 violaColor = vec3(0.85, 0.6, 1.0);
          vec3 col = mix(aurumColor, violaColor, uTransition);

          gl_FragColor = vec4(col, intensity * vAlpha * 0.65);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.dustPoints = new THREE.Points(geometry, this.dustMaterial);
    this.group.add(this.dustPoints);
  }

  public setRealm(realm: RealmType) {
    this.targetRealm = realm;
  }

  public update(delta: number, elapsedTime: number) {
    const target = this.targetRealm === 'viola' ? 1.0 : 0.0;
    this.transitionProgress = THREE.MathUtils.damp(this.transitionProgress, target, 2.5, delta);

    // Update shader uniforms
    this.nebulaMaterial.uniforms.uTime.value = elapsedTime;
    this.nebulaMaterial.uniforms.uTransition.value = this.transitionProgress;

    this.starMaterial.uniforms.uTime.value = elapsedTime;

    this.dustMaterial.uniforms.uTime.value = elapsedTime;
    this.dustMaterial.uniforms.uTransition.value = this.transitionProgress;

    // Update lights color and intensity
    const aurumKey = new THREE.Color(0xfff0d0);
    const violaKey = new THREE.Color(0xeee5ff);
    this.keyLight.color.lerpColors(aurumKey, violaKey, this.transitionProgress);

    const aurumHorizon = new THREE.Color(0xf59e0b);
    const violaHorizon = new THREE.Color(0xa855f7);
    this.horizonLight.color.lerpColors(aurumHorizon, violaHorizon, this.transitionProgress);

    // Animate dust particles
    const pos = this.dustPositions;
    const vel = this.dustVelocities;
    const count = pos.length / 3;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += vel[i * 3] * delta * 2.0;
      pos[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.05 * delta;
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta * 1.5;

      // Wrap boundaries
      if (pos[i * 3] > 50) pos[i * 3] = -50;
      if (pos[i * 3 + 2] < -50) pos[i * 3 + 2] = 30;
      if (pos[i * 3 + 1] > 14) pos[i * 3 + 1] = 0.5;
    }
    this.dustPoints.geometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.nebulaMaterial.dispose();
    this.starMaterial.dispose();
    this.dustMaterial.dispose();
    this.nebulaMesh.geometry.dispose();
    this.starfield.geometry.dispose();
    this.dustPoints.geometry.dispose();
  }
}
