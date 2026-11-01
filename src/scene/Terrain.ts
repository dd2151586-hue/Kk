import * as THREE from 'three';
import { RealmType } from '../types/cosmic';

/**
 * Terrain and Procedural Scenery:
 * - Undulating ground terrain plane extending into horizon fog
 * - Aurum Realm:
 *     - 10-part Procedural Rustic Farmhouse with glowing interior windows and lantern
 *     - 8-part Procedural Classic Pickup Truck with wheels, chrome trim, and headlights
 *     - Instanced swaying golden wheat / grass field
 * - Viola Realm:
 *     - 9-part Procedural Astronaut (spacefarer with reflective visor, backpack, suit)
 *     - Instanced glowing violet cosmic flowers / stalks
 * - Smooth transition visibility between Aurum and Viola props
 */
export class CosmicTerrain {
  public group: THREE.Group;

  // Ground plane
  private groundMesh!: THREE.Mesh;
  private groundMaterial!: THREE.ShaderMaterial;

  // Aurum Props
  private aurumGroup: THREE.Group;
  private farmhouseGroup!: THREE.Group;
  private truckGroup!: THREE.Group;
  private wheatInstances!: THREE.InstancedMesh;

  // Viola Props
  private violaGroup: THREE.Group;
  private astronautGroup!: THREE.Group;
  private flowerInstances!: THREE.InstancedMesh;

  // Lights
  private houseLight!: THREE.PointLight;
  private truckLightLeft!: THREE.SpotLight;
  private truckLightRight!: THREE.SpotLight;
  private astronautBeacon!: THREE.PointLight;

  // Animation & Transition
  private targetRealm: RealmType = 'aurum';
  private transitionProgress: number = 0.0;
  private wheatMaterial!: THREE.ShaderMaterial;
  private flowerMaterial!: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.aurumGroup = new THREE.Group();
    this.violaGroup = new THREE.Group();
    this.group.add(this.aurumGroup);
    this.group.add(this.violaGroup);

    this.createGround();
    this.createAurumFarmhouse();
    this.createAurumTruck();
    this.createAurumWheatField();

    this.createViolaAstronaut();
    this.createViolaFloraField();

    // Initial state: Aurum visible, Viola hidden
    this.violaGroup.position.y = -20;
    this.violaGroup.visible = false;
  }

  private createGround() {
    // Large terrain plane with subtle rolling elevation
    const geometry = new THREE.PlaneGeometry(160, 160, 64, 64);
    geometry.rotateX(-Math.PI / 2);

    // Apply procedural undulating elevation
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle slope rising toward the foreground and rolling hills
      const elevation = Math.sin(x * 0.04) * Math.cos(z * 0.03) * 0.8 + Math.sin(z * 0.08) * 0.4;
      pos.setY(i, elevation);
    }
    geometry.computeVertexNormals();

    this.groundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTransition: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTransition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          // Distance fog falloff towards the black hole horizon
          float dist = length(vWorldPosition.xz - vec2(0.0, -45.0));
          float horizonGlow = smoothstep(10.0, 75.0, dist);

          // Aurum Ground: dark loamy soil with warm golden amber sheen
          vec3 aurumGround = vec3(0.04, 0.025, 0.012);
          vec3 aurumRimGlow = vec3(0.35, 0.18, 0.03) * (1.0 - horizonGlow * 0.7);
          vec3 aurumCol = aurumGround + aurumRimGlow;

          // Viola Ground: deep violet obsidian with mystical purple horizon reflection
          vec3 violaGround = vec3(0.02, 0.012, 0.038);
          vec3 violaRimGlow = vec3(0.22, 0.08, 0.35) * (1.0 - horizonGlow * 0.7);
          vec3 violaCol = violaGround + violaRimGlow;

          vec3 finalColor = mix(aurumCol, violaCol, uTransition);

          // Horizon atmospheric fog blend
          float fog = smoothstep(55.0, 110.0, length(vWorldPosition.xz));
          finalColor = mix(finalColor, vec3(0.0), fog * 0.85);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    this.groundMesh = new THREE.Mesh(geometry, this.groundMaterial);
    this.groundMesh.position.set(0, -0.6, 0);
    this.group.add(this.groundMesh);
  }

  /**
   * 10-part Procedural Rustic Farmhouse (silhouette + warm glowing windows)
   */
  private createAurumFarmhouse() {
    this.farmhouseGroup = new THREE.Group();
    // Positioned to the right of camera view as in the reference video!
    this.farmhouseGroup.position.set(7.8, 0, -18.0);
    this.farmhouseGroup.rotation.y = -0.15;

    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x151210,
      roughness: 0.85,
      metalness: 0.1,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0d0b09,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Intense warm incandescent glowing window material
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffe299,
      emissive: 0xffaa22,
      emissiveIntensity: 3.2,
      roughness: 0.2,
      metalness: 0.1,
    });

    // 1. Main House Cabin Body
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 5.5), darkWoodMat);
    mainBody.position.set(0, 2.1, 0);
    this.farmhouseGroup.add(mainBody);

    // 2. Gabled Main Roof (Prism / Extruded triangle)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-4.1, 0);
    roofShape.lineTo(0, 2.8);
    roofShape.lineTo(4.1, 0);
    roofShape.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: 6.2,
      bevelEnabled: false,
    });
    roofGeo.center();
    const mainRoof = new THREE.Mesh(roofGeo, roofMat);
    mainRoof.rotation.y = Math.PI / 2;
    mainRoof.position.set(0, 5.5, 0);
    this.farmhouseGroup.add(mainRoof);

    // 3. Front Porch Deck & Steps
    const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 2.2), darkWoodMat);
    porchDeck.position.set(0, 0.2, 3.8);
    this.farmhouseGroup.add(porchDeck);

    // 4. Porch Roof & Columns
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.25, 2.4), roofMat);
    porchRoof.position.set(0, 2.9, 3.8);
    this.farmhouseGroup.add(porchRoof);

    // Porch wooden columns (4 posts)
    for (let c = -3.6; c <= 3.6; c += 2.4) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 0.18), darkWoodMat);
      post.position.set(c, 1.55, 4.8);
      this.farmhouseGroup.add(post);
    }

    // 5. Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.4, 0.9), darkWoodMat);
    chimney.position.set(2.4, 6.2, -1.2);
    this.farmhouseGroup.add(chimney);

    // 6. Dormer Windows on Upper Roof (2 dormers)
    for (let d = -1.6; d <= 1.6; d += 3.2) {
      const dormer = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.2), darkWoodMat);
      dormer.position.set(d, 5.0, 1.8);
      this.farmhouseGroup.add(dormer);

      const dormerWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), windowMat);
      dormerWindow.position.set(d, 5.0, 2.42);
      this.farmhouseGroup.add(dormerWindow);
    }

    // 7. Ground Floor Glowing Windows (Front facade)
    const windowPositions = [
      [-2.4, 1.8, 2.76],
      [-0.8, 1.8, 2.76],
      [1.6, 1.8, 2.76],
      [2.8, 1.8, 2.76],
    ];
    windowPositions.forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.25), windowMat);
      win.position.set(wx, wy, wz);
      this.farmhouseGroup.add(win);
    });

    // 8. Side facade windows
    const sideWin1 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), windowMat);
    sideWin1.rotation.y = -Math.PI / 2;
    sideWin1.position.set(-3.76, 1.8, 0);
    this.farmhouseGroup.add(sideWin1);

    // 9. Porch Warm Lantern Light
    this.houseLight = new THREE.PointLight(0xffb74d, 2.5, 18, 1.5);
    this.houseLight.position.set(0, 2.6, 4.5);
    this.farmhouseGroup.add(this.houseLight);

    this.aurumGroup.add(this.farmhouseGroup);
  }

  /**
   * 8-part Procedural Classic Pickup Truck parked by the farmhouse
   */
  private createAurumTruck() {
    this.truckGroup = new THREE.Group();
    // Parked in side-profile/quarter view as seen in reference video
    this.truckGroup.position.set(-1.8, 0, -16.0);
    this.truckGroup.rotation.y = Math.PI / 2 + 0.12;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181a1c,
      roughness: 0.35,
      metalness: 0.85, // Glossy metallic vintage pickup
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0e,
      roughness: 0.9,
      metalness: 0.05,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.15,
      metalness: 0.95,
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffaea,
      emissiveIntensity: 2.8,
      roughness: 0.1,
    });

    // 1. Truck Bed & Lower Chassis
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 2.5), bodyMat);
    bed.position.set(0, 0.75, -1.1);
    this.truckGroup.add(bed);

    // 2. Cabin & Hood
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, 1.6), bodyMat);
    cab.position.set(0, 1.35, 0.7);
    this.truckGroup.add(cab);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.65, 1.5), bodyMat);
    hood.position.set(0, 0.85, 2.15);
    this.truckGroup.add(hood);

    // 3. Windshield & Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.1,
      metalness: 0.9,
    });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.6, 0.1), glassMat);
    windshield.position.set(0, 1.45, 1.52);
    windshield.rotation.x = -0.25;
    this.truckGroup.add(windshield);

    // 4. Wheels (4 tires with chrome rims)
    const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.35, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelPositions = [
      [-1.15, 0.44, 1.8],  // Front-Left
      [1.15, 0.44, 1.8],   // Front-Right
      [-1.15, 0.44, -1.2], // Rear-Left
      [1.15, 0.44, -1.2],  // Rear-Right
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      this.truckGroup.add(wheel);

      const hubcap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.37, 12), chromeMat);
      hubcap.rotateZ(Math.PI / 2);
      hubcap.position.set(wx, wy, wz);
      this.truckGroup.add(hubcap);
    });

    // 5. Front Chrome Bumper & Grille
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.25, 0.25), chromeMat);
    bumper.position.set(0, 0.45, 2.95);
    this.truckGroup.add(bumper);

    // 6. Headlights
    const hlLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 14), headlightMat);
    hlLeft.rotateX(Math.PI / 2);
    hlLeft.position.set(-0.7, 0.85, 2.92);
    this.truckGroup.add(hlLeft);

    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.7;
    this.truckGroup.add(hlRight);

    // Subtle headlights beam lighting
    this.truckLightLeft = new THREE.SpotLight(0xffeedd, 1.8, 25, Math.PI / 6, 0.4);
    this.truckLightLeft.position.set(-0.7, 0.85, 2.95);
    this.truckLightLeft.target.position.set(-0.7, 0, 18);
    this.truckGroup.add(this.truckLightLeft);
    this.truckGroup.add(this.truckLightLeft.target);

    this.aurumGroup.add(this.truckGroup);
  }

  /**
   * Instanced Swaying Golden Wheat Field (2000 instances)
   */
  private createAurumWheatField() {
    const wheatCount = 2400;
    // Simple tapered blade of wheat grass
    const bladeGeo = new THREE.ConeGeometry(0.06, 1.4, 4);
    bladeGeo.translate(0, 0.7, 0); // bottom-center pivot

    this.wheatMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindSpeed: { value: 1.2 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWindSpeed;
        varying vec2 vUv;
        varying float vHeight;

        void main() {
          vUv = uv;
          vHeight = position.y / 1.4;

          vec3 transformed = position;
          // Sway with wind gusts
          float wind = sin(uTime * 2.0 * uWindSpeed + instanceMatrix[3][0] * 0.4 + instanceMatrix[3][2] * 0.3);
          transformed.x += wind * vHeight * 0.35;
          transformed.z += cos(uTime * 1.5 * uWindSpeed + instanceMatrix[3][0] * 0.5) * vHeight * 0.2;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vHeight;

        void main() {
          // Warm golden wheat gradient: root dark ochre -> golden amber tip
          vec3 baseColor = vec3(0.28, 0.18, 0.05);
          vec3 tipColor = vec3(0.95, 0.72, 0.22);
          vec3 col = mix(baseColor, tipColor, vHeight);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    this.wheatInstances = new THREE.InstancedMesh(bladeGeo, this.wheatMaterial, wheatCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < wheatCount; i++) {
      // Disperse across foreground and midground (-35 to 35 on x, -28 to 15 on z)
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 45 - 5;
      const scale = 0.8 + Math.random() * 0.5;

      dummy.position.set(x, 0, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      this.wheatInstances.setMatrixAt(i, dummy.matrix);
    }

    this.wheatInstances.instanceMatrix.needsUpdate = true;
    this.aurumGroup.add(this.wheatInstances);
  }

  /**
   * 9-part Procedural Spacefarer / Astronaut (Viola Realm)
   */
  private createViolaAstronaut() {
    this.astronautGroup = new THREE.Group();
    // Centered in midground looking directly toward the black hole horizon as in video!
    this.astronautGroup.position.set(0, 0.1, -4.0);
    this.astronautGroup.scale.set(1.15, 1.15, 1.15);
    this.astronautGroup.rotation.y = Math.PI; // Facing away from camera, toward black hole

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24, // High-tech charcoal EVA suit
      roughness: 0.5,
      metalness: 0.35,
    });

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d12,
      roughness: 0.3,
      metalness: 0.7,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold reflective EVA visor
      roughness: 0.1,
      metalness: 0.98,
    });

    const glowLedMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Violet life support indicator LED
    });

    // 1. Helmet Sphere & Neck Seal
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), suitMat);
    helmet.position.set(0, 2.7, 0);
    this.astronautGroup.add(helmet);

    // 2. Reflective Gold Visor
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20, 0, Math.PI, 0, Math.PI * 0.65), visorMat);
    visor.position.set(0, 2.7, 0.12);
    visor.rotation.x = Math.PI * 0.15;
    this.astronautGroup.add(visor);

    // 3. Torso Chestpack Unit
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 1.25, 16), suitMat);
    torso.scale.set(1.1, 1.0, 0.7);
    torso.position.set(0, 1.75, 0);
    this.astronautGroup.add(torso);

    // Collar ring
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 12, 24), armorMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 2.32, 0);
    this.astronautGroup.add(collar);

    // 4. Life-Support Primary Backpack (PLSS)
    const backpack = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 1.1, 16), armorMat);
    backpack.scale.set(1.15, 1.0, 0.65);
    backpack.position.set(0, 1.8, -0.38);
    this.astronautGroup.add(backpack);

    // Status diodes on backpack (facing camera when astronaut looks at black hole)
    const diode1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), glowLedMat);
    diode1.position.set(-0.2, 2.05, -0.62);
    this.astronautGroup.add(diode1);

    const diode2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    diode2.position.set(0.2, 2.05, -0.62);
    this.astronautGroup.add(diode2);

    // 5. Left & Right Shoulder Pauldrons
    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), armorMat);
    lShoulder.position.set(-0.62, 2.15, 0);
    this.astronautGroup.add(lShoulder);

    const rShoulder = lShoulder.clone();
    rShoulder.position.x = 0.62;
    this.astronautGroup.add(rShoulder);

    // 6. Arms & Gloves
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.1, 12), suitMat);
    lArm.position.set(-0.62, 1.5, 0);
    this.astronautGroup.add(lArm);

    const rArm = lArm.clone();
    rArm.position.x = 0.62;
    this.astronautGroup.add(rArm);

    // 7. Legs & Boots
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.25, 12), suitMat);
    lLeg.position.set(-0.28, 0.65, 0);
    this.astronautGroup.add(lLeg);

    const rLeg = lLeg.clone();
    rLeg.position.x = 0.28;
    this.astronautGroup.add(rLeg);

    // 8. Soles / Boots
    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.55), armorMat);
    lBoot.position.set(-0.28, 0.1, 0.08);
    this.astronautGroup.add(lBoot);

    const rBoot = lBoot.clone();
    rBoot.position.x = 0.28;
    this.astronautGroup.add(rBoot);

    // Subtle violet beacon aura around astronaut
    this.astronautBeacon = new THREE.PointLight(0xc084fc, 1.4, 8, 2.0);
    this.astronautBeacon.position.set(0, 2.0, 0);
    this.astronautGroup.add(this.astronautBeacon);

    this.violaGroup.add(this.astronautGroup);
  }

  /**
   * Instanced Glowing Violet Flora Field (Viola Realm)
   */
  private createViolaFloraField() {
    const flowerCount = 2800;
    // Flower stalk with glowing blossom crown
    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 5);
    stalkGeo.translate(0, 0.55, 0);

    this.flowerMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindSpeed: { value: 1.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWindSpeed;
        varying float vHeight;

        void main() {
          vHeight = position.y / 1.1;
          vec3 transformed = position;

          // Subtle harmonic wave swaying
          float sway = sin(uTime * 1.8 * uWindSpeed + instanceMatrix[3][0] * 0.6) * vHeight * 0.22;
          transformed.x += sway;
          transformed.z += cos(uTime * 1.2 * uWindSpeed + instanceMatrix[3][2] * 0.5) * vHeight * 0.15;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vHeight;

        void main() {
          // Violet luminescence: dark stem -> brilliant glowing magenta/violet blossom
          vec3 stemCol = vec3(0.08, 0.02, 0.16);
          vec3 blossomCol = vec3(0.85, 0.45, 1.0);
          vec3 glowTip = vec3(0.98, 0.85, 1.0);

          vec3 col = mix(stemCol, blossomCol, smoothstep(0.1, 0.8, vHeight));
          col = mix(col, glowTip, smoothstep(0.8, 1.0, vHeight));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    this.flowerInstances = new THREE.InstancedMesh(stalkGeo, this.flowerMaterial, flowerCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < flowerCount; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = Math.random() * 34 - 24; // spans -24 to +10, filling the field up to the camera
      const scale = 0.8 + Math.random() * 0.7;

      dummy.position.set(x, 0, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      this.flowerInstances.setMatrixAt(i, dummy.matrix);
    }

    this.flowerInstances.instanceMatrix.needsUpdate = true;
    this.violaGroup.add(this.flowerInstances);
  }

  public setRealm(realm: RealmType) {
    this.targetRealm = realm;
  }

  public setWindSpeed(speed: number) {
    this.wheatMaterial.uniforms.uWindSpeed.value = speed;
    this.flowerMaterial.uniforms.uWindSpeed.value = speed;
  }

  public update(delta: number, elapsedTime: number) {
    const target = this.targetRealm === 'viola' ? 1.0 : 0.0;
    this.transitionProgress = THREE.MathUtils.damp(this.transitionProgress, target, 2.5, delta);

    // Update shaders
    this.groundMaterial.uniforms.uTime.value = elapsedTime;
    this.groundMaterial.uniforms.uTransition.value = this.transitionProgress;

    this.wheatMaterial.uniforms.uTime.value = elapsedTime;
    this.flowerMaterial.uniforms.uTime.value = elapsedTime;

    // Smooth prop crossfade
    // When transitionProgress < 0.5: Aurum is dominant
    // When transitionProgress > 0.5: Viola is dominant
    this.aurumGroup.visible = this.transitionProgress < 0.98;
    this.violaGroup.visible = this.transitionProgress > 0.02;

    // Smooth vertical slide / emergence
    this.aurumGroup.position.y = THREE.MathUtils.damp(
      this.aurumGroup.position.y,
      this.targetRealm === 'aurum' ? 0 : -20,
      3.0,
      delta
    );

    this.violaGroup.position.y = THREE.MathUtils.damp(
      this.violaGroup.position.y,
      this.targetRealm === 'viola' ? 0 : -20,
      3.0,
      delta
    );

    // Subtle idle breathing for the astronaut
    if (this.astronautGroup && this.violaGroup.visible) {
      this.astronautGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
    }
  }

  public dispose() {
    this.groundMaterial.dispose();
    this.wheatMaterial.dispose();
    this.flowerMaterial.dispose();
    this.groundMesh.geometry.dispose();
    this.wheatInstances.geometry.dispose();
    this.flowerInstances.geometry.dispose();
  }
}
