/**
 * THE LAST CASE - 3D Laboratory Environment Engine
 * Three.js WebGL: Controlled lighting, realistic lab props, smooth camera navigation.
 */

class Scene3DEngine {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.interactableObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0);
        this.hoveredClue = null;

        // Camera smoothing & focus
        this.targetCamPos = new THREE.Vector3(0, 2.2, 5.5);
        this.targetCamLook = new THREE.Vector3(0, 1.4, 0);
        this.currentLook = new THREE.Vector3(0, 1.4, 0);
        this.isInspecting = false;
        this.originalCamPos = new THREE.Vector3(0, 2.2, 5.5);

        // Emergency beacons
        this.alarmLights = [];
        this.isAlarmActive = false;

        // Custom animated props
        this.animatedProps = [];
    }

    init(containerElement) {
        this.container = containerElement;
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x06080d);
        this.scene.fog = new THREE.FogExp2(0x06080d, 0.045);

        // Camera
        this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
        this.camera.position.copy(this.targetCamPos);

        // WebGL Renderer — alpha:true so the canvas can be transparent,
        // allowing the blurred CSS lab background image to show through.
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.renderer.setClearColor(0x000000, 0); // fully transparent clear
        this.container.appendChild(this.renderer.domElement);

        // Orbit / First-person style smooth controls
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going through floor
            this.controls.minDistance = 1.5;
            this.controls.maxDistance = 16;
            this.controls.target.copy(this.targetCamLook);
        }

        // Setup base lighting
        this.setupLighting();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onClick(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Start render loop
        this.animate();
    }

    setupLighting() {
        // Deep ambient tone
        const ambient = new THREE.AmbientLight(0x0e1726, 0.95);
        this.scene.add(ambient);

        // Soft overhead diffuse panel light
        const mainLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
        mainLight.position.set(2, 6, 3);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);

        // Subtle desk lamp warm accent
        const deskLamp = new THREE.PointLight(0xfef08a, 1.2, 6);
        deskLamp.position.set(-0.8, 1.6, -0.6);
        this.scene.add(deskLamp);

        // Emergency red beacons along ceiling
        [-4, 4].forEach(x => {
            const redLight = new THREE.PointLight(0xef4444, 0, 10);
            redLight.position.set(x, 4.2, 0);
            this.scene.add(redLight);
            this.alarmLights.push(redLight);
        });
    }

    setAlarm(active) {
        this.isAlarmActive = active;
        if (!active) {
            this.alarmLights.forEach(l => l.intensity = 0);
        }
    }

    clearScene() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const child = this.scene.children[i];
            if (child.isMesh || child.isGroup || child.isPoints || child.isLight || child.isGridHelper) {
                this.scene.remove(child);
            }
        }
        this.interactableObjects = [];
        this.animatedProps = [];
        this.alarmLights = [];
    }

    // ==========================================================================
    // EXTERIOR SCENE — Shown during boot, registration & cinematic story
    // Players are OUTSIDE the Orion Research Facility; crime scene not visible.
    // ==========================================================================

    buildExteriorScene() {
        this.clearScene();
        this.isInspecting = false;

        // ── Sky gradient backdrop ──────────────────────────────────────────────
        this.scene.background = new THREE.Color(0x02050d);
        this.scene.fog = new THREE.FogExp2(0x030710, 0.055);

        // ── Flat mountain ground (dark slate) ─────────────────────────────────
        const groundGeo = new THREE.PlaneGeometry(80, 80, 12, 12);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x080d14, roughness: 0.95 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // ── Mountain silhouette peaks (dark, backlit) ─────────────────────────
        const peakMat = new THREE.MeshStandardMaterial({ color: 0x060c18, roughness: 1 });
        [
            { x: -18, z: -28, w: 22, h: 16 },
            { x:  -4, z: -30, w: 18, h: 22 },
            { x:  14, z: -26, w: 24, h: 13 },
            { x:  28, z: -24, w: 16, h: 11 },
        ].forEach(p => {
            const peak = new THREE.Mesh(new THREE.ConeGeometry(p.w / 2, p.h, 6), peakMat);
            peak.position.set(p.x, p.h / 2 - 0.5, p.z);
            this.scene.add(peak);
        });

        // ── Orion Facility building (cold steel block) ────────────────────────
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0x0d1627, roughness: 0.6, metalness: 0.5 });
        const building = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 8), buildingMat);
        building.position.set(0, 3, -18);
        building.castShadow = true;
        this.scene.add(building);

        // Roof antenna / comms dish silhouette
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        antenna.position.set(2.5, 8.5, -18);
        this.scene.add(antenna);

        // Window strips — cold blue-white glow
        [[0, 3.5], [-3.2, 3.5], [3.2, 3.5], [0, 1.5]].forEach(([wx, wy]) => {
            const win = new THREE.Mesh(
                new THREE.PlaneGeometry(1.4, 0.7),
                new THREE.MeshBasicMaterial({ color: 0x94b4d4, transparent: true, opacity: 0.55 })
            );
            win.position.set(wx, wy, -14.05);
            this.scene.add(win);

            // Window glow point light (very subtle)
            const glow = new THREE.PointLight(0x7fb0d8, 0.4, 4);
            glow.position.set(wx, wy, -13.5);
            this.scene.add(glow);
        });

        // ── Security amber beacon on building roof ────────────────────────────
        this.exteriorBeacon = new THREE.PointLight(0xf59e0b, 1.8, 14);
        this.exteriorBeacon.position.set(-1.5, 7.2, -18);
        this.scene.add(this.exteriorBeacon);

        const beaconBulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        beaconBulb.position.copy(this.exteriorBeacon.position);
        this.scene.add(beaconBulb);
        this.exteriorBeaconMesh = beaconBulb;

        // ── Gate / fence in foreground ────────────────────────────────────────
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
        for (let x = -10; x <= 10; x += 1.6) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), fenceMat);
            post.position.set(x, 1.1, -6);
            this.scene.add(post);
        }
        const rail = new THREE.Mesh(new THREE.BoxGeometry(21, 0.06, 0.06), fenceMat);
        rail.position.set(0, 2.2, -6);
        this.scene.add(rail);

        // ── Rain particle system ──────────────────────────────────────────────
        const rainCount = 1800;
        const rainPositions = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3]     = (Math.random() - 0.5) * 60;
            rainPositions[i * 3 + 1] = Math.random() * 22;
            rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        const rainGeo = new THREE.BufferGeometry();
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        const rainMat = new THREE.PointsMaterial({ color: 0x6b8fad, size: 0.065, transparent: true, opacity: 0.45 });
        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.scene.add(this.rainParticles);

        // ── Ambient + rim lighting ────────────────────────────────────────────
        this.scene.add(new THREE.AmbientLight(0x0a1428, 1.2));
        const rimLight = new THREE.DirectionalLight(0x1d3a5c, 0.6);
        rimLight.position.set(-8, 10, 4);
        this.scene.add(rimLight);

        // ── Camera positioned at facility gate looking inward ─────────────────
        this.targetCamPos.set(0, 2.2, 4);
        this.targetCamLook.set(0, 3.5, -18);
        this.camera.position.copy(this.targetCamPos);
        if (this.controls) {
            this.controls.target.copy(this.targetCamLook);
            this.controls.update();
        }

        // Store rain positions for animation
        this._rainPositions = rainPositions;
        this._rainGeo = rainGeo;
    }

    // ==========================================================================
    // 3D MAIN LABORATORY (HERO CRIME SCENE)
    // ==========================================================================

    buildMainLaboratory() {
        this.clearScene();
        this.setupLighting();
        this.isInspecting = false;

        // ── TRANSPARENT background so the blurred CSS lab photo shows through ──
        this.scene.background = null;
        this.scene.fog = new THREE.FogExp2(0x06080d, 0.025);

        // Clean up exterior-only references
        this.exteriorBeacon = null;
        this.rainParticles = null;
        this._rainPositions = null;
        this._rainGeo = null;

        // Floor: ultra light transparent layer so the dead scientist body on the floor in the background image is clearly seen!
        const floorGeo = new THREE.PlaneGeometry(22, 22);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0c1017,
            roughness: 0.25,
            metalness: 0.65,
            transparent: true,
            opacity: 0.22
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Subtle Grid lines on floor
        const gridHelper = new THREE.GridHelper(22, 22, 0x1e293b, 0x111827);
        gridHelper.position.y = 0.005;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Lab Walls — semi-transparent so background bleeds at edges
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.7, transparent: true, opacity: 0.5 });
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 0.4), wallMat);
        backWall.position.set(0, 3.5, -9);
        this.scene.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 22), wallMat);
        leftWall.position.set(-10, 3.5, 0);
        this.scene.add(leftWall);

        // Heavy Security Blast Door on Back Wall
        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        doorFrame.position.set(0, 2.6, -8.7);
        this.scene.add(doorFrame);

        this.blastDoor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
        this.blastDoor.position.set(0, 2.6, -8.65);
        this.scene.add(this.blastDoor);

        // Door status indicator strip
        const doorStatusStrip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        doorStatusStrip.position.set(0, 4.8, -8.45);
        this.scene.add(doorStatusStrip);

        // Vikram's Central Research Workbench
        const deskGroup = new THREE.Group();
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 }));
        deskTop.position.set(0, 0.95, -0.6);
        deskTop.castShadow = true;
        deskTop.receiveShadow = true;
        deskGroup.add(deskTop);

        // Steel desk legs
        [-2.4, 2.4].forEach(x => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 2.0), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 }));
            leg.position.set(x, 0.475, -0.6);
            deskGroup.add(leg);
        });
        this.scene.add(deskGroup);

        // Dual Monitor Stand on Desk
        const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        monitorStand.position.set(0, 1.45, -1.2);
        this.scene.add(monitorStand);

        const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        screenGlow.position.set(0, 1.45, -1.15);
        this.scene.add(screenGlow);

        // Overturned Ergonomic Chair
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        chair.position.set(1.5, 0.35, 0.6);
        chair.rotation.z = Math.PI / 2.2;
        chair.rotation.y = 0.4;
        this.scene.add(chair);

        // Forensic Crime Scene Chalk Silhouette & Body Marker (clearly visible on the foreground floor)
        const chalkGeo = new THREE.PlaneGeometry(1.9, 3.2);
        const chalkMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.65 });
        const chalkOutline = new THREE.Mesh(chalkGeo, chalkMat);
        chalkOutline.rotation.x = -Math.PI / 2;
        chalkOutline.rotation.z = 0.25;
        chalkOutline.position.set(0.2, 0.02, 1.2);
        this.scene.add(chalkOutline);

        // Body area localized forensic spotlight (illuminates the body area clearly)
        const bodySpotlight = new THREE.PointLight(0xe2e8f0, 2.0, 5.0);
        bodySpotlight.position.set(0.2, 1.8, 1.2);
        this.scene.add(bodySpotlight);

        // Forensic Yellow Evidence Marker Cone
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 4), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        cone.position.set(-0.8, 0.17, 1.6);
        this.scene.add(cone);

        // Server Racks on Left Wall
        for (let z = -6; z <= -2; z += 1.8) {
            const rack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 }));
            rack.position.set(-9.2, 2.1, z);
            this.scene.add(rack);

            const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.2), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
            led.position.set(-8.75, 2.8, z);
            this.scene.add(led);
        }

        // Ceiling Ventilation Shaft & Open Grate directly above desk
        const ventDuct = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
        ventDuct.position.set(-2.2, 5.8, 0);
        this.scene.add(ventDuct);

        const openGrate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide }));
        openGrate.rotation.x = Math.PI / 2;
        openGrate.position.set(-2.2, 5.35, -2.4);
        this.scene.add(openGrate);

        // ======================================================================
        // 6 PHYSICAL EVIDENCE CLUE PROPS — ALL 6 PERFECTLY VISIBLE IN VIEW
        // ======================================================================

        // 1. Laptop (on desk, center)
        this.createClueMesh("laptop", 0.4, 1.08, -0.4, 0.7, 0.12, 0.5, 0x38bdf8, "VIKRAM'S LAPTOP");
        this.addEvidenceLight(0.4, 1.8, -0.4, 0x38bdf8);

        // 2. Handwritten Note (left side of desk, illuminated in yellow)
        this.createClueMesh("note", -1.6, 1.06, -0.3, 0.45, 0.05, 0.35, 0xfef08a, "HANDWRITTEN NOTE");
        this.addEvidenceLight(-1.6, 1.7, -0.3, 0xfef08a);

        // 3. Master Security Card — PUT IN FRONT! Right on the foreground floor near the player camera!
        this.createClueMesh("accessCard", -0.7, 0.12, 2.8, 0.5, 0.08, 0.32, 0xef4444, "MASTER SECURITY CARD");
        this.addEvidenceLight(-0.7, 0.9, 2.8, 0xef4444);

        // 4. Shattered Chemical Vial (under ventilation grate — emerald green glow)
        this.createClueMesh("brokenGlass", -2.2, 0.12, -2.4, 0.55, 0.15, 0.55, 0x10b981, "SHATTERED CHEMICAL VIAL");
        this.addEvidenceLight(-2.2, 0.9, -2.4, 0x10b981);

        // 5. Vikram's Smartwatch (beside the body outline — cyan glow)
        this.createClueMesh("smartwatch", 1.3, 0.12, 1.5, 0.35, 0.1, 0.35, 0x38bdf8, "VIKRAM'S SMARTWATCH");
        this.addEvidenceLight(1.3, 0.8, 1.5, 0x38bdf8);

        // 6. Encrypted USB Token (front-right desk edge — vivid purple)
        this.createClueMesh("usbDevice", 2.0, 1.12, 0.2, 0.38, 0.15, 0.2, 0xa855f7, "ENCRYPTED USB TOKEN");
        this.addEvidenceLight(2.0, 1.8, 0.2, 0xa855f7);

        // Reset camera view
        this.targetCamPos.set(0, 2.4, 5.5);
        this.targetCamLook.set(0, 1.2, 0);
        if (this.controls) {
            this.controls.target.copy(this.targetCamLook);
        }
    }

    // ==========================================================================
    // 3D SECURITY & DIGITAL CONTROL ROOM (ROUND 2 HERO ENVIRONMENT)
    // Server racks, multi-display CCTV security consoles, access terminal hub.
    // ==========================================================================

    buildControlRoomScene() {
        this.clearScene();
        this.isInspecting = false;

        // Dark high-tech cyber security palette
        this.scene.background = new THREE.Color(0x040711);
        this.scene.fog = new THREE.FogExp2(0x040711, 0.035);

        // Clean up exterior references
        this.exteriorBeacon = null;
        this.rainParticles = null;
        this._rainPositions = null;
        this._rainGeo = null;

        // Slate floor with subtle dark reflections
        const floorGeo = new THREE.PlaneGeometry(24, 24);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x090d16,
            roughness: 0.15,
            metalness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Security grid pattern
        const gridHelper = new THREE.GridHelper(24, 24, 0x1e3a5f, 0x0a1424);
        gridHelper.position.y = 0.005;
        this.scene.add(gridHelper);

        // Back Wall (Security Surveillance Wall)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x0c121e, roughness: 0.6 });
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 0.4), wallMat);
        backWall.position.set(0, 4, -10);
        this.scene.add(backWall);

        // Left & Right walls
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 24), wallMat);
        leftWall.position.set(-11, 4, 0);
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 24), wallMat);
        rightWall.position.set(11, 4, 0);
        this.scene.add(rightWall);

        // Main Central Security Console Station (Desks + Curved array)
        const consoleDesk = new THREE.Mesh(
            new THREE.BoxGeometry(7.5, 0.95, 2.4),
            new THREE.MeshStandardMaterial({ color: 0x111927, roughness: 0.25, metalness: 0.85 })
        );
        consoleDesk.position.set(0, 0.475, -2.5);
        this.scene.add(consoleDesk);

        // CCTV Monitor Wall on Back Wall (Array of 6 monitors)
        this.cctvMonitors = [];
        const monitorGeo = new THREE.PlaneGeometry(2.4, 1.4);
        const cctvColors = [0x0284c7, 0x0369a1, 0x0f766e, 0x0369a1, 0x0284c7, 0x0f766e];
        let mIdx = 0;
        for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
                const monFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x030712 }));
                monFrame.position.set(col * 3.2, 4.8 - row * 1.9, -9.75);
                this.scene.add(monFrame);

                const monScreen = new THREE.Mesh(monitorGeo, new THREE.MeshBasicMaterial({ color: cctvColors[mIdx % cctvColors.length] }));
                monScreen.position.set(col * 3.2, 4.8 - row * 1.9, -9.68);
                this.scene.add(monScreen);
                this.cctvMonitors.push(monScreen);
                mIdx++;
            }
        }

        // Left Wall: 4 High-Density Server Racks with pulsating LEDs
        this.serverLeds = [];
        for (let z = -7; z <= 1; z += 2.2) {
            const server = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.8), new THREE.MeshStandardMaterial({ color: 0x030712, metalness: 0.9 }));
            server.position.set(-10, 2.75, z);
            this.scene.add(server);

            // Pulsing LED stripes
            const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            ledStrip.position.set(-9.35, 3.8, z);
            this.scene.add(ledStrip);
            this.serverLeds.push(ledStrip);

            const ledStrip2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
            ledStrip2.position.set(-9.35, 2.5, z);
            this.scene.add(ledStrip2);
            this.serverLeds.push(ledStrip2);
        }

        // Overhead Cyan Ambient Downlight
        const overheadLight = new THREE.PointLight(0x38bdf8, 2.2, 14);
        overheadLight.position.set(0, 5.8, -2);
        this.scene.add(overheadLight);

        // Security Console Glow Light
        const consoleLight = new THREE.PointLight(0x0ea5e9, 2.8, 6);
        consoleLight.position.set(0, 1.8, -2.5);
        this.scene.add(consoleLight);

        // ======================================================================
        // ROUND 2 INTERACTION TERMINALS IN 3D
        // 1. Access Logs Terminal (Center Desk)
        // 2. Suspect Dossier Station (Left Desk)
        // 3. Technical Log Reconstruction Terminal (Right Desk)
        // 4. Deleted Message Recovery Unit (Mainframe Rack)
        // ======================================================================

        // 1. Access Logs Terminal (Hero Central Terminal)
        this.createClueMesh("term_access", 0.0, 1.15, -2.4, 0.95, 0.25, 0.65, 0x38bdf8, "ACCESS LOG TERMINAL");
        this.addEvidenceLight(0.0, 1.9, -2.4, 0x38bdf8);

        // 2. Suspect Interview Archive Terminal (Left side of console)
        this.createClueMesh("term_suspects", -2.4, 1.12, -2.4, 0.85, 0.22, 0.55, 0xf59e0b, "SUSPECT DOSSIER STATION");
        this.addEvidenceLight(-2.4, 1.8, -2.4, 0xf59e0b);

        // 3. Technical Event Reconstruction Terminal (Right side of console)
        this.createClueMesh("term_tech", 2.4, 1.12, -2.4, 0.85, 0.22, 0.55, 0x10b981, "TECHNICAL EVENT CONSOLE");
        this.addEvidenceLight(2.4, 1.8, -2.4, 0x10b981);

        // 4. Recovered Communication Terminal (Decryption terminal at Server Rack)
        this.createClueMesh("term_comms", -8.5, 1.25, -2.0, 0.75, 0.35, 0.75, 0xa855f7, "DELETED COMMUNICATION UNIT");
        this.addEvidenceLight(-8.5, 2.0, -2.0, 0xa855f7);

        // Camera initial orientation inside Control Room
        this.targetCamPos.set(0, 2.3, 4.2);
        this.targetCamLook.set(0, 1.4, -2.5);
        this.camera.position.copy(this.targetCamPos);
        if (this.controls) {
            this.controls.target.copy(this.targetCamLook);
        }
    }

    // Adds a colored point light above an evidence item so it glows
    addEvidenceLight(x, y, z, color) {
        const light = new THREE.PointLight(color, 2.5, 3.5);
        light.position.set(x, y, z);
        this.scene.add(light);
    }

    createClueMesh(clueId, x, y, z, w, h, d, color, label) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.35,
            roughness: 0.2,
            metalness: 0.7
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.userData = { clueId: clueId, label: label, baseColor: color };
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.interactableObjects.push(mesh);

        // Bright ground highlight ring — larger and more visible
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(w * 0.9, w * 1.2, 32),
            new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, y - h / 2 + 0.01, z);
        this.scene.add(ring);
    }

    // Raycast check for hover
    onMouseMove(e) {
        // Calculate normalized device coordinates
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects);

        const reticle = document.getElementById('reticle');
        const prompt = document.getElementById('interaction-prompt');

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            this.hoveredClue = obj.userData.clueId;

            if (reticle) reticle.classList.add('active');
            if (prompt) {
                prompt.style.display = 'flex';
                prompt.innerHTML = `<span class="key-badge">E</span> INVESTIGATE ${obj.userData.label}`;
            }
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.hoveredClue = null;
            if (reticle) reticle.classList.remove('active');
            if (prompt) prompt.style.display = 'none';
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    onClick(e) {
        if (this.hoveredClue && window.onInvestigateClue) {
            window.onInvestigateClue(this.hoveredClue);
        }
    }

    onKeyDown(e) {
        if (e.code === 'KeyE' && this.hoveredClue && window.onInvestigateClue) {
            window.onInvestigateClue(this.hoveredClue);
        }
    }

    // Smooth camera focus onto an evidence object
    focusOnClue(clueId) {
        const obj = this.interactableObjects.find(o => o.userData.clueId === clueId);
        if (!obj) return;

        this.isInspecting = true;
        this.originalCamPos.copy(this.camera.position);

        // Move camera close and look directly down at object
        this.targetCamPos.set(obj.position.x, obj.position.y + 0.75, obj.position.z + 0.85);
        this.targetCamLook.copy(obj.position);
    }

    resetCameraFocus() {
        this.isInspecting = false;
        this.targetCamPos.set(0, 2.4, 5.5);
        this.targetCamLook.set(0, 1.2, 0);
    }

    // Smoothly moves the exterior camera to a new position/look target.
    // Called per cinematic beat so the 3D background reacts to the story.
    // The lab interior is NEVER built while this is in use.
    setCinematicCamera(px, py, pz, lx, ly, lz) {
        this.targetCamPos.set(px, py, pz);
        this.targetCamLook.set(lx, ly, lz);
        if (this.controls) {
            this.controls.target.set(lx, ly, lz);
        }
    }

    // Unlocking Door Animation for Round 1 Completion
    triggerDoorUnlockAnimation(callback) {
        if (!this.blastDoor) {
            if (callback) callback();
            return;
        }

        // Camera slowly dollies toward the door
        this.targetCamPos.set(0, 2.6, -4.5);
        this.targetCamLook.set(0, 2.6, -8.65);

        // Slide the heavy door open upward
        let progress = 0;
        const slideInterval = setInterval(() => {
            progress += 0.025;
            this.blastDoor.position.y = THREE.MathUtils.lerp(2.6, 7.2, progress);
            if (progress >= 1) {
                clearInterval(slideInterval);
                if (callback) callback();
            }
        }, 30);
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = performance.now() * 0.001;

        // Alarm lights pulse
        if (this.isAlarmActive) {
            const intensity = Math.sin(time * 5) > 0 ? 2.5 : 0.2;
            this.alarmLights.forEach(l => l.intensity = intensity);
        }

        // Smooth cinematic camera position lerp (exterior shots + clue focus)
        this.camera.position.lerp(this.targetCamPos, 0.03);

        // Smooth camera lerping
        if (this.controls) {
            this.controls.target.lerp(this.targetCamLook, 0.03);
            this.controls.update();
        }

        // Exterior: amber security beacon slow pulse
        if (this.exteriorBeacon) {
            this.exteriorBeacon.intensity = 1.4 + Math.sin(time * 1.8) * 0.7;
        }

        // Exterior: rain particles slowly falling
        if (this.rainParticles && this._rainPositions && this._rainGeo) {
            for (let i = 0; i < this._rainPositions.length / 3; i++) {
                this._rainPositions[i * 3 + 1] -= 0.04;
                if (this._rainPositions[i * 3 + 1] < 0) {
                    this._rainPositions[i * 3 + 1] = 22;
                }
            }
            this._rainGeo.attributes.position.needsUpdate = true;
        }

        // Round 2: Server rack LED subtle pulsation
        if (this.serverLeds && this.serverLeds.length > 0) {
            this.serverLeds.forEach((led, idx) => {
                const flicker = 0.5 + 0.5 * Math.sin(time * 3 + idx);
                led.material.opacity = flicker > 0.3 ? 1.0 : 0.4;
            });
        }

        // Round 2: Subtle monitor screen refresh
        if (this.cctvMonitors && this.cctvMonitors.length > 0) {
            const mScan = 0.85 + 0.15 * Math.sin(time * 4);
            this.cctvMonitors[0].material.color.setRGB(0.01 * mScan, 0.45 * mScan, 0.85 * mScan);
        }

        // Round 3: P9 tower core pulse
        if (this.p9TowerCore) {
            const pulse = 0.7 + 0.3 * Math.sin(time * 2.2);
            this.p9TowerCore.material.emissiveIntensity = pulse * 0.8;
        }
        if (this.p9DataScreens) {
            this.p9DataScreens.forEach((s, i) => {
                const flicker = 0.75 + 0.25 * Math.sin(time * 3.5 + i * 1.1);
                s.material.color.setRGB(0, 0.28 * flicker, 0.55 * flicker);
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    // ── HELPER: Create an interactable clue mesh (glowing terminal block) ──
    createClueMesh(clueId, x, y, z, w, h, d, color, label) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.35,
            metalness: 0.6,
            roughness: 0.4,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.userData.clueId = clueId;
        mesh.userData.label = label;
        this.scene.add(mesh);
        this.interactableObjects.push(mesh);
        return mesh;
    }

    // ── HELPER: Add a small point light above an evidence station ──
    addEvidenceLight(x, y, z, color) {
        const light = new THREE.PointLight(color, 1.2, 3.5);
        light.position.set(x, y, z);
        this.scene.add(light);
        return light;
    }

    // ── ROUND 3: PROJECT 9 CHAMBER ──────────────────────────────────────────
    buildP9ChamberScene() {

        this.clearScene();

        // Ambient — deep cyan blue
        const ambient = new THREE.AmbientLight(0x070d1a, 1.0);
        this.scene.add(ambient);
        const cyanFill = new THREE.PointLight(0x0ea5e9, 1.8, 28);
        cyanFill.position.set(0, 4, 0);
        this.scene.add(cyanFill);
        const blueFill = new THREE.PointLight(0x0284c7, 1.0, 22);
        blueFill.position.set(-6, 3, -4);
        this.scene.add(blueFill);

        // Floor — dark metallic
        const floorGeo = new THREE.PlaneGeometry(22, 22);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x050b14, roughness: 0.9, metalness: 0.4 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        // Grid helper — subtle cyan
        const grid = new THREE.GridHelper(22, 22, 0x0c2a40, 0x0c2a40);
        this.scene.add(grid);

        // Back wall
        const wallGeo = new THREE.PlaneGeometry(22, 10);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x040810, roughness: 1 });
        const backWall = new THREE.Mesh(wallGeo, wallMat);
        backWall.position.set(0, 5, -11);
        this.scene.add(backWall);

        // ── CENTRAL PROJECT 9 TOWER ──
        const towerGeo = new THREE.CylinderGeometry(0.55, 0.7, 4.5, 16);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x091828, metalness: 0.8, roughness: 0.3 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(0, 2.25, -2);
        this.scene.add(tower);

        // Tower core (emissive cyan)
        const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.0, 12);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8, transparent: true, opacity: 0.85 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 2.25, -2);
        this.scene.add(core);
        this.p9TowerCore = core;

        // Tower point light
        const towerLight = new THREE.PointLight(0x38bdf8, 2.5, 8);
        towerLight.position.set(0, 3.5, -2);
        this.scene.add(towerLight);

        // ── GLASS PANELS (transparent sides) ──
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.08, roughness: 0, metalness: 0.1 });
        const panelGeo = new THREE.BoxGeometry(0.05, 3.5, 3.5);
        [-2.5, 2.5].forEach(x => {
            const p = new THREE.Mesh(panelGeo, glassMat);
            p.position.set(x, 1.75, -2);
            this.scene.add(p);
        });
        const panelGeoFront = new THREE.BoxGeometry(3.5, 3.5, 0.05);
        const pFront = new THREE.Mesh(panelGeoFront, glassMat);
        pFront.position.set(0, 1.75, 0);
        this.scene.add(pFront);

        // ── DATA SCREENS on back wall ──
        const screenMat1 = new THREE.MeshStandardMaterial({ color: 0x002244, emissive: 0x002244, emissiveIntensity: 0.5 });
        this.p9DataScreens = [];
        [-4, -1.3, 1.3, 4].forEach((x, i) => {
            const sGeo = new THREE.PlaneGeometry(1.9, 1.1);
            const sMat = new THREE.MeshStandardMaterial({ color: 0x00264a, emissive: 0x004477, emissiveIntensity: 0.4 });
            const screen = new THREE.Mesh(sGeo, sMat);
            screen.position.set(x, 6.2, -10.8);
            this.scene.add(screen);
            this.p9DataScreens.push(screen);
        });

        // ── SERVER RACKS on left wall ──
        for (let i = 0; i < 3; i++) {
            const rackGeo = new THREE.BoxGeometry(1.0, 3.5, 0.6);
            const rackMat = new THREE.MeshStandardMaterial({ color: 0x0a1a2e, metalness: 0.7, roughness: 0.4 });
            const rack = new THREE.Mesh(rackGeo, rackMat);
            rack.position.set(-9, 1.75, -3 + i * 2.5);
            this.scene.add(rack);
            // LED strip
            const ledGeo = new THREE.BoxGeometry(0.05, 2.8, 0.04);
            const ledMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.7 });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(-8.47, 1.75, -3 + i * 2.5);
            this.scene.add(led);
        }

        // ── INTERACTION TERMINALS (6 stations) ──
        const stations = [
            { id: 'term_p9',        x: -4.5, y: 1.12, z: 1.2, w: 0.95, h: 0.35, d: 0.65, color: 0x38bdf8, label: 'P9 PREDICTION TERMINAL' },
            { id: 'term_eighth',    x: -2.3, y: 1.12, z: 2.5, w: 0.95, h: 0.35, d: 0.65, color: 0xf59e0b, label: 'EIGHTH SIGNATURE CONSOLE' },
            { id: 'term_hidden_ws', x: 0.0,  y: 1.12, z: 3.1, w: 0.95, h: 0.35, d: 0.65, color: 0xef4444, label: 'CONCEALED WORKSTATION H-07' },
            { id: 'term_archive',   x: 2.3,  y: 1.12, z: 2.5, w: 0.95, h: 0.35, d: 0.65, color: 0xa855f7, label: 'PROJECT 9 ARCHIVE UNIT' },
            { id: 'term_anika_link',x: 4.5,  y: 1.12, z: 1.2, w: 0.95, h: 0.35, d: 0.65, color: 0x10b981, label: 'ANIKA CONTRADICTION MATRIX' },
            { id: 'term_board',     x: 0.0,  y: 1.25, z: 0.2, w: 1.35, h: 0.45, d: 0.75, color: 0xeab308, label: 'EVIDENCE CONNECTION BOARD' },
        ];

        stations.forEach(s => {
            // Desk pedestal
            const deskGeo = new THREE.BoxGeometry(s.w * 1.1, 0.95, s.d * 1.1);
            const deskMat = new THREE.MeshStandardMaterial({ color: 0x091424, metalness: 0.7, roughness: 0.4 });
            const desk = new THREE.Mesh(deskGeo, deskMat);
            desk.position.set(s.x, 0.48, s.z);
            this.scene.add(desk);

            // Screen/Terminal (Interactable Clue Mesh)
            this.createClueMesh(s.id, s.x, s.y, s.z, s.w, s.h, s.d, s.color, s.label);
            this.addEvidenceLight(s.x, s.y + 0.8, s.z, s.color);

            // Vertical angled terminal screen
            const sGeo = new THREE.BoxGeometry(s.w * 0.85, 0.55, 0.05);
            const sMat = new THREE.MeshStandardMaterial({
                color: 0x011326,
                emissive: s.color,
                emissiveIntensity: 0.45,
                metalness: 0.8,
                roughness: 0.2
            });
            const scr = new THREE.Mesh(sGeo, sMat);
            scr.position.set(s.x, s.y + 0.38, s.z - 0.15);
            scr.rotation.x = -0.25;
            this.scene.add(scr);
        });

        // Set camera for clear first-person / orbit view inside P9 Chamber
        this.targetCamPos.set(0, 2.6, 6.2);
        this.targetCamLook.set(0, 1.3, 1.2);
        this.camera.position.copy(this.targetCamPos);
        if (this.controls) {
            this.controls.target.copy(this.targetCamLook);
            this.controls.update();
        }
    }
}

window.scene3d = new Scene3DEngine();
