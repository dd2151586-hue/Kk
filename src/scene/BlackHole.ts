import * as THREE from 'three';
import { RealmType } from '../types/cosmic';

/**
 * Supermassive Black Hole System
 * Features:
 * - High-fidelity Relativistic Gravitational Lensing Shader (Kerr Metric Kip Thorne formulation)
 * - Razor-sharp Event Horizon Shadow
 * - Lensed Upper Crown Arc & Lower Under-Arc
 * - Dynamic Doppler Beaming (approaching side relativistic boosting)
 * - Swirling Turbulent Accretion Plasma with multi-octave FBM
 * - Infalling Relativistic Particle Stream
 * - Volumetric Atmospheric Corona / Einstein Ring Haze
 */
export class BlackHoleSystem {
  public group: THREE.Group;

  // Master billboard mesh for the black hole & gravitational lensing
  private masterMesh!: THREE.Mesh;
  private masterMaterial!: THREE.ShaderMaterial;

  // Relativistic inflow particles
  private particleSystem!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleSeeds!: Float32Array;
  private particleCount: number = 2200;

  // Transition state
  private targetRealm: RealmType = 'aurum';
  private transitionProgress: number = 0.0; // 0 = Aurum, 1 = Viola

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    // Towering on the cosmic horizon matching reference video framing
    this.group.position.set(0, 15.5, -42);
    scene.add(this.group);

    this.createBlackHoleRelativisticMesh();
    this.createInflowParticles();
  }

  private createBlackHoleRelativisticMesh() {
    // Large billboard quad facing camera
    const geometry = new THREE.PlaneGeometry(72, 72);

    this.masterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpinSpeed: { value: 0.85 },
        uBrightness: { value: 1.25 },
        uDoppler: { value: 0.85 },
        uLensingStrength: { value: 1.0 },
        uTransition: { value: 0.0 }, // 0 = Aurum, 1 = Viola
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpinSpeed;
        uniform float uBrightness;
        uniform float uDoppler;
        uniform float uLensingStrength;
        uniform float uTransition;

        varying vec2 vUv;
        varying vec3 vWorldPosition;

        // 3D Simplex noise for plasma turbulence
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fbm(vec3 p) {
          float v = 0.0;
          v += 0.5000 * snoise(p); p *= 2.02;
          v += 0.2500 * snoise(p); p *= 2.03;
          v += 0.1250 * snoise(p); p *= 2.01;
          v += 0.0625 * snoise(p);
          return v;
        }

        // Accretion disk plasma radiance function
        float diskRadiance(float diskR, float angle, float time, float spin) {
          float rNorm = (diskR - 0.28) / (0.92 - 0.28);
          if (rNorm < 0.0 || rNorm > 1.0) return 0.0;

          // Keplerian differential rotation
          float angSpeed = spin * (1.6 / pow(rNorm + 0.35, 1.3));
          float rotAngle = angle + time * angSpeed;

          // Swirling plasma noise
          vec3 noiseCoord = vec3(cos(rotAngle) * (rNorm * 7.0 + 3.0), sin(rotAngle) * (rNorm * 7.0 + 3.0), time * 0.22);
          float plasma = fbm(noiseCoord) * 0.5 + 0.5;

          // High frequency rings
          float ringStriations = sin(rNorm * 55.0 + plasma * 3.5) * 0.15 + 0.85;

          // Radial falloff: intense near ISCO, smooth fade to outer edge
          float radialGlow = pow(1.0 - rNorm, 1.7) * 2.2 + pow(sin(rNorm * 3.14159), 2.0) * 0.8;

          // Doppler beaming: approaching side (x < 0, angle in quadrant 2 & 3) is boosted
          float doppler = 1.0 - sin(angle) * uDoppler * (1.0 - rNorm * 0.3);
          doppler = pow(max(0.08, doppler), 2.4);

          return plasma * ringStriations * radialGlow * doppler;
        }

        void main() {
          // Normalize coordinate to [-1, 1], aspect ratio 1:1
          vec2 p = (vUv - vec2(0.5)) * 2.0;
          float r = length(p);

          // Physical parameters
          float rHorizon = 0.25; // Event Horizon radius
          float rPhoton = 0.268; // Photon sphere radius
          float tilt = 0.22;     // Accretion disk tilt angle (~12.6 degrees)

          // 1. EVENT HORIZON SHADOW
          // Pure pitch black inside event horizon
          if (r < rHorizon) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }

          // 2. PHOTON SPHERE RING (Infinite light bending)
          float photonRing = 0.0;
          if (r >= rHorizon && r < rPhoton + 0.045) {
            float distToPhoton = abs(r - rPhoton);
            photonRing = exp(-distToPhoton * 90.0) * 3.8;
          }

          // 3. GRAVITATIONAL LENSING CALCULATION
          // Ray deflection angle in General Relativity alpha ~ 4M / r
          // Light rays passing close to the black hole are bent around it
          float deflection = (uLensingStrength * 0.12) / pow(r - rHorizon + 0.05, 1.15);
          
          // Deflected position for light coming from behind the black hole
          vec2 pLensed = p - normalize(p) * deflection;

          // --- DIRECT ACCRETION DISK (Equatorial Plane) ---
          // Flatten Y coordinate by sin(tilt) to map disk plane
          vec2 pDirectDisk = vec2(p.x, p.y / sin(tilt));
          float rDirect = length(pDirectDisk);
          float angleDirect = atan(pDirectDisk.y, pDirectDisk.x);

          // Direct disk is visible in front (p.y <= 0) and outside shadow
          float directEmission = 0.0;
          if (p.y <= 0.08 || r > rHorizon + 0.08) {
            // Check disk radius bounds
            if (rDirect >= 0.28 && rDirect <= 0.95) {
              // Soft edge profile in Y to give disk physical vertical thickness
              float diskThickness = 0.045 * (rDirect + 0.2);
              float distToPlane = abs(p.y - pDirectDisk.y * sin(tilt));
              float thicknessFade = smoothstep(diskThickness, 0.0, distToPlane);

              directEmission = diskRadiance(rDirect, angleDirect, uTime, uSpinSpeed) * thicknessFade;
            }
          }

          // --- LENSED ACCRETION DISK (Upper Crown & Lower Under-Arc) ---
          // Light from back of disk bent over the top (crown) and under bottom
          float lensedEmission = 0.0;
          vec2 pLensedDisk = vec2(pLensed.x, pLensed.y / sin(tilt * 1.8));
          float rLensed = length(pLensedDisk);
          float angleLensed = atan(pLensedDisk.y, pLensedDisk.x);

          if (rLensed >= 0.28 && rLensed <= 0.95) {
            // Lensed crown profile: arches over the top of the event horizon
            float crownProfile = smoothstep(0.0, 0.06, abs(r - (rHorizon + 0.08 + (1.0 - abs(p.x) * 0.8) * 0.18)));
            crownProfile = 1.0 - clamp(crownProfile, 0.0, 1.0);

            // Lower arc profile
            float underProfile = smoothstep(0.0, 0.04, abs(r - (rHorizon + 0.04 + (1.0 - abs(p.x) * 0.8) * 0.08)));
            underProfile = 1.0 - clamp(underProfile, 0.0, 1.0);

            float arcGlow = (p.y > 0.0 ? crownProfile * 1.4 : underProfile * 0.8);
            lensedEmission = diskRadiance(rLensed, angleLensed, uTime, uSpinSpeed) * arcGlow;
          }

          // Atmospheric Einstein glow
          float corona = pow(max(0.0, 1.0 - r), 3.0) * 0.35 + pow(max(0.0, 1.0 - r * 1.5), 6.0) * 0.6;

          // Total Relativistic Radiance
          float totalRadiance = (directEmission + lensedEmission * 1.35 + photonRing + corona * 0.4) * uBrightness;

          // Discard empty distant space to let stars shine through
          if (totalRadiance < 0.005 && r > rHorizon + 0.02) {
            discard;
          }

          // COLOR PALETTES
          // 1. AURUM: Deep burnt obsidian -> golden amber -> incandescent core white
          vec3 aurumVoid = vec3(0.02, 0.01, 0.005);
          vec3 aurumAmber = vec3(1.0, 0.62, 0.12);
          vec3 aurumHot = vec3(1.0, 0.96, 0.82);
          vec3 aurumColor = mix(aurumVoid, aurumAmber, smoothstep(0.05, 0.65, totalRadiance));
          aurumColor = mix(aurumColor, aurumHot, smoothstep(0.65, 1.8, totalRadiance));
          if (photonRing > 0.5) aurumColor += vec3(1.0, 0.95, 0.85) * (photonRing * 0.4);

          // 2. VIOLA: Cosmic violet -> electric lavender -> blinding white arc
          vec3 violaVoid = vec3(0.015, 0.005, 0.03);
          vec3 violaPurple = vec3(0.72, 0.35, 0.98);
          vec3 violaHot = vec3(0.96, 0.92, 1.0);
          vec3 violaColor = mix(violaVoid, violaPurple, smoothstep(0.05, 0.65, totalRadiance));
          violaColor = mix(violaColor, violaHot, smoothstep(0.65, 1.8, totalRadiance));
          if (photonRing > 0.5) violaColor += vec3(0.98, 0.95, 1.0) * (photonRing * 0.4);

          // Smooth transition between Aurum and Viola
          vec3 finalColor = mix(aurumColor, violaColor, uTransition);

          // Calculate alpha
          float alpha = clamp(totalRadiance * 1.4, 0.0, 1.0);
          // Sharp event horizon edge
          if (r < rHorizon + 0.008) {
            alpha = 1.0;
            finalColor = vec3(0.0);
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });

    this.masterMesh = new THREE.Mesh(geometry, this.masterMaterial);
    this.masterMesh.renderOrder = 3;
    this.group.add(this.masterMesh);
  }

  private createInflowParticles() {
    const geometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleSeeds = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const radius = 9.0 + Math.random() * 26.0;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3.5 * (radius / 26.0);

      this.particlePositions[i * 3] = Math.cos(angle) * radius;
      this.particlePositions[i * 3 + 1] = height;
      this.particlePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.4; // elliptical tilt

      this.particleVelocities[i * 3] = radius;
      this.particleVelocities[i * 3 + 1] = angle;
      this.particleVelocities[i * 3 + 2] = 0.02 + Math.random() * 0.03;

      this.particleSeeds[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(this.particleSeeds, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTransition: { value: 0.0 },
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        varying float vAlpha;
        varying float vSeed;

        void main() {
          vSeed = aSeed;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(mvPosition.xyz);
          gl_PointSize = (12.0 * aSeed + 4.0) * (30.0 / dist);
          vAlpha = clamp(1.0 - (dist / 65.0), 0.2, 0.9);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTransition;
        varying float vAlpha;
        varying float vSeed;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float intensity = pow(1.0 - dist * 2.0, 1.8);

          vec3 aurumCol = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.5, 0.1), vSeed);
          vec3 violaCol = mix(vec3(0.9, 0.8, 1.0), vec3(0.6, 0.25, 0.95), vSeed);
          vec3 col = mix(aurumCol, violaCol, uTransition);

          gl_FragColor = vec4(col, intensity * vAlpha * 0.7);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(geometry, particleMat);
    this.particleSystem.renderOrder = 4;
    this.group.add(this.particleSystem);
  }

  public setRealm(realm: RealmType) {
    this.targetRealm = realm;
  }

  public setSpinSpeed(speed: number) {
    this.masterMaterial.uniforms.uSpinSpeed.value = speed;
  }

  public setBrightness(brightness: number) {
    this.masterMaterial.uniforms.uBrightness.value = brightness;
  }

  public setLensingStrength(strength: number) {
    this.masterMaterial.uniforms.uLensingStrength.value = strength;
  }

  public setDopplerBeaming(doppler: number) {
    this.masterMaterial.uniforms.uDoppler.value = doppler;
  }

  public update(delta: number, elapsedTime: number) {
    const target = this.targetRealm === 'viola' ? 1.0 : 0.0;
    this.transitionProgress = THREE.MathUtils.damp(this.transitionProgress, target, 2.5, delta);

    // Update master shader
    this.masterMaterial.uniforms.uTime.value = elapsedTime;
    this.masterMaterial.uniforms.uTransition.value = this.transitionProgress;

    // Update particle shader
    const pMat = this.particleSystem.material as THREE.ShaderMaterial;
    pMat.uniforms.uTime.value = elapsedTime;
    pMat.uniforms.uTransition.value = this.transitionProgress;

    // Animate inflow particles
    const pos = this.particlePositions;
    const vel = this.particleVelocities;
    const count = this.particleCount;

    for (let i = 0; i < count; i++) {
      let r = vel[i * 3];
      let angle = vel[i * 3 + 1];
      const speed = vel[i * 3 + 2];

      const angVel = 0.8 * (1.6 / Math.pow(r * 0.15 + 0.3, 1.2));
      angle += angVel * delta;
      r -= speed * (1.0 + (30.0 - r) * 0.1) * delta * 2.0;

      if (r < 7.5) {
        r = 28.0 + Math.random() * 4.0;
        angle = Math.random() * Math.PI * 2;
      }

      vel[i * 3] = r;
      vel[i * 3 + 1] = angle;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle * 2.0 + i) * 0.5 * (r / 28.0);
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.35;
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.masterMaterial.dispose();
    this.masterMesh.geometry.dispose();
    this.particleSystem.geometry.dispose();
    (this.particleSystem.material as THREE.Material).dispose();
  }
}
