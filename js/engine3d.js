/* ============================================
   3D ENGINE - Three.js World Renderer
   Third-person camera, terrain, buildings
   ============================================ */

const Engine3D = {
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerMesh: null,
    clock: null,
    
    // Camera
    cameraDistance: 25,
    cameraHeight: 18,
    cameraAngleX: 0,
    cameraAngleY: 0.6,
    
    // Player movement
    moveSpeed: 0.4,
    runSpeed: 0.7,
    isRunning: false,
    playerPos: { x: 0, y: 0, z: 0 },
    playerRotation: 0,
    playerVelocity: { x: 0, z: 0 },
    
    // World objects
    worldObjects: [],
    enemyMeshes: [],
    npcMeshes: [],
    chestMeshes: [],
    groundMesh: null,
    skybox: null,
    lights: [],
    particles: [],
    
    // State
    currentRegionId: null,
    isPointerLocked: false,
    keys: {},
    mouseMovement: { x: 0, y: 0 },
    
    // Animation
    animTime: 0,
    playerBobOffset: 0,
    
    init() {
        this.clock = new THREE.Clock();
        
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Fog
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);
        
        // Lights
        this.setupLights();
        
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Input
        this.setupInput();
    },
    
    setupLights() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x6688cc, 0.5);
        this.scene.add(ambient);
        this.lights.push(ambient);
        
        // Directional (sun)
        const sun = new THREE.DirectionalLight(0xffffee, 1.0);
        sun.position.set(50, 80, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 200;
        sun.shadow.camera.left = -80;
        sun.shadow.camera.right = 80;
        sun.shadow.camera.top = 80;
        sun.shadow.camera.bottom = -80;
        this.scene.add(sun);
        this.lights.push(sun);
        
        // Hemisphere
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x445533, 0.4);
        this.scene.add(hemi);
        this.lights.push(hemi);
    },
    
    setupInput() {
        document.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isRunning = true;
        });
        document.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isRunning = false;
        });
        
        document.addEventListener('mousemove', e => {
            if (this.isPointerLocked) {
                this.cameraAngleX -= e.movementX * 0.003;
                this.cameraAngleY = Math.max(0.2, Math.min(1.2, this.cameraAngleY - e.movementY * 0.003));
            }
        });
        
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', () => {
            if (Game && Game.mode === 'explore' && !this.isPointerLocked) {
                canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.getElementById('game-canvas');
        });

        // Touch support
        this.setupTouchControls();
    },

    setupTouchControls() {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isTouchDevice) return;

        const touchControls = document.getElementById('touch-controls');
        if (touchControls) touchControls.classList.remove('hidden');

        // Joystick
        const joystickBase = document.querySelector('.joystick-base');
        const joystickThumb = document.getElementById('joystick-thumb');
        let joystickActive = false;
        let joystickCenter = { x: 0, y: 0 };

        if (joystickBase) {
            joystickBase.addEventListener('touchstart', (e) => {
                e.preventDefault();
                joystickActive = true;
                const rect = joystickBase.getBoundingClientRect();
                joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            });

            document.addEventListener('touchmove', (e) => {
                if (!joystickActive) return;
                const touch = e.touches[0];
                const dx = touch.clientX - joystickCenter.x;
                const dy = touch.clientY - joystickCenter.y;
                const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
                const angle = Math.atan2(dy, dx);
                const nx = Math.cos(angle) * dist;
                const ny = Math.sin(angle) * dist;
                if (joystickThumb) {
                    joystickThumb.style.transform = `translate(${nx}px, ${ny}px)`;
                }
                // Map to keys
                this.keys['KeyW'] = dy < -10;
                this.keys['KeyS'] = dy > 10;
                this.keys['KeyA'] = dx < -10;
                this.keys['KeyD'] = dx > 10;
            });

            document.addEventListener('touchend', () => {
                joystickActive = false;
                if (joystickThumb) joystickThumb.style.transform = '';
                this.keys['KeyW'] = false;
                this.keys['KeyS'] = false;
                this.keys['KeyA'] = false;
                this.keys['KeyD'] = false;
            });
        }

        // Look area
        const lookArea = document.getElementById('touch-look');
        if (lookArea) {
            let lastTouch = null;
            lookArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
                lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            });
            lookArea.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!lastTouch) return;
                const touch = e.touches[0];
                const dx = touch.clientX - lastTouch.x;
                const dy = touch.clientY - lastTouch.y;
                this.cameraAngleX -= dx * 0.005;
                this.cameraAngleY = Math.max(0.2, Math.min(1.2, this.cameraAngleY - dy * 0.005));
                lastTouch = { x: touch.clientX, y: touch.clientY };
            });
            lookArea.addEventListener('touchend', () => { lastTouch = null; });
        }

        // Touch buttons
        const interactBtn = document.getElementById('touch-interact');
        if (interactBtn) {
            interactBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['KeyE'] = true;
                setTimeout(() => { this.keys['KeyE'] = false; }, 200);
            });
        }
    },
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    loadRegion(regionId) {
        // Clear existing
        this.clearWorld();
        
        const region = World.getRegion(regionId);
        if (!region) return;
        
        this.currentRegionId = regionId;
        
        // Set scene atmosphere based on region type
        this.setAtmosphere(region);
        
        // Ground
        this.createGround(region);
        
        // Sky
        this.createSky(region);
        
        // Buildings
        this.createBuildings(region);
        
        // Enemies
        this.createEnemyMeshes(region);
        
        // NPCs
        this.createNPCMeshes(region);
        
        // Chests
        this.createChestMeshes(region);
        
        // Player
        this.createPlayer(region);
        
        // Decorations
        this.addDecorations(region);
        
        // Reset camera
        this.cameraAngleX = 0;
        this.cameraAngleY = 0.6;
    },
    
    clearWorld() {
        // Remove all non-light objects
        const toRemove = [];
        this.scene.traverse(child => {
            if (child.isLight || child === this.scene) return;
            toRemove.push(child);
        });
        toRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.worldObjects = [];
        this.enemyMeshes = [];
        this.npcMeshes = [];
        this.chestMeshes = [];
        this.particles = [];
    },
    
    setAtmosphere(region) {
        switch (region.type) {
            case 'village':
                this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);
                this.scene.background = new THREE.Color(0x87CEEB);
                break;
            case 'forest':
                this.scene.fog = new THREE.FogExp2(0x2d5a27, 0.006);
                this.scene.background = new THREE.Color(0x3d7a37);
                break;
            case 'city':
                this.scene.fog = new THREE.FogExp2(0x8899aa, 0.003);
                this.scene.background = new THREE.Color(0x8899aa);
                break;
            case 'cave':
                this.scene.fog = new THREE.FogExp2(0x1a0a2e, 0.008);
                this.scene.background = new THREE.Color(0x1a0a2e);
                break;
            case 'castle':
                this.scene.fog = new THREE.FogExp2(0x332211, 0.004);
                this.scene.background = new THREE.Color(0x554433);
                break;
        }
    },
    
    createGround(region) {
        const size = region.terrain.size;
        const groundGeo = new THREE.PlaneGeometry(size, size, 32, 32);
        
        // Add some terrain variation
        const positions = groundGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5 +
                         Math.sin(x * 0.05 + z * 0.05) * 0.8;
            positions.setZ(i, noise);
        }
        groundGeo.computeVertexNormals();
        
        const groundMat = new THREE.MeshLambertMaterial({ 
            color: region.terrain.ground,
            side: THREE.DoubleSide
        });
        
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);
        
        // Add path/road
        if (region.type === 'village' || region.type === 'city') {
            const pathGeo = new THREE.PlaneGeometry(4, size * 0.8);
            const pathMat = new THREE.MeshLambertMaterial({ color: '#8B7355' });
            const path = new THREE.Mesh(pathGeo, pathMat);
            path.rotation.x = -Math.PI / 2;
            path.position.y = 0.05;
            this.scene.add(path);
            
            const pathCross = new THREE.Mesh(pathGeo, pathMat);
            pathCross.rotation.x = -Math.PI / 2;
            pathCross.rotation.z = Math.PI / 2;
            pathCross.position.y = 0.05;
            this.scene.add(pathCross);
        }
    },
    
    createSky(region) {
        const skyGeo = new THREE.SphereGeometry(400, 32, 32);
        let skyColor1, skyColor2;
        
        switch (region.type) {
            case 'village': skyColor1 = 0x87CEEB; skyColor2 = 0x4488cc; break;
            case 'forest': skyColor1 = 0x5a8a5a; skyColor2 = 0x2d5a27; break;
            case 'city': skyColor1 = 0x7799bb; skyColor2 = 0x445566; break;
            case 'cave': skyColor1 = 0x1a0a2e; skyColor2 = 0x0a0018; break;
            case 'castle': skyColor1 = 0x665544; skyColor2 = 0x332211; break;
        }
        
        const skyMat = new THREE.MeshBasicMaterial({
            color: skyColor1,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
    },
    
    createBuildings(region) {
        region.buildings.forEach(b => {
            let mesh;
            const color = new THREE.Color(b.color);
            
            switch (b.type) {
                case 'house':
                case 'cabin':
                    mesh = this.createHouse(b, color);
                    break;
                case 'building':
                    mesh = this.createBuilding(b, color);
                    break;
                case 'shop':
                case 'lab':
                    mesh = this.createShop(b, color);
                    break;
                case 'tower':
                    mesh = this.createTower(b, color);
                    break;
                case 'tree':
                    mesh = this.createTree(b, color);
                    break;
                case 'rock':
                case 'stalagmite':
                    mesh = this.createRock(b, color);
                    break;
                case 'crystal':
                    mesh = this.createCrystal(b, color);
                    break;
                case 'fence':
                case 'castle_wall':
                    mesh = this.createWall(b, color);
                    break;
                case 'monument':
                case 'banner':
                case 'lamp':
                    mesh = this.createPillar(b, color);
                    break;
                case 'well':
                case 'pool':
                    mesh = this.createPool(b, color);
                    break;
                case 'throne':
                    mesh = this.createThrone(b, color);
                    break;
                default:
                    mesh = this.createBox(b, color);
            }
            
            if (mesh) {
                mesh.position.set(b.x, (b.h || 4) / 2, b.z);
                this.scene.add(mesh);
                this.worldObjects.push({ mesh, data: b });
            }
        });
    },
    
    createHouse(b, color) {
        const group = new THREE.Group();
        
        // Base
        const baseGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const baseMat = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Roof
        const roofGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.7, b.h * 0.5, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = b.h * 0.5 + b.h * 0.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // Door
        const doorGeo = new THREE.BoxGeometry(b.w * 0.25, b.h * 0.5, 0.2);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, -b.h * 0.25, b.d / 2 + 0.1);
        group.add(door);
        
        return group;
    },
    
    createBuilding(b, color) {
        const group = new THREE.Group();
        
        const baseGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const baseMat = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Windows
        const winGeo = new THREE.BoxGeometry(b.w * 0.15, b.h * 0.12, 0.3);
        const winMat = new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: 0x444422 });
        for (let floor = 0; floor < Math.floor(b.h / 4); floor++) {
            for (let wx = -1; wx <= 1; wx += 2) {
                const win = new THREE.Mesh(winGeo, winMat);
                win.position.set(wx * b.w * 0.25, -b.h / 2 + 3 + floor * 4, b.d / 2 + 0.15);
                group.add(win);
            }
        }
        
        return group;
    },
    
    createShop(b, color) {
        const group = new THREE.Group();
        
        const baseGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const baseMat = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        group.add(base);
        
        // Awning
        const awnGeo = new THREE.BoxGeometry(b.w + 2, 0.5, 3);
        const awnMat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
        const awning = new THREE.Mesh(awnGeo, awnMat);
        awning.position.set(0, b.h * 0.15, b.d / 2 + 1.5);
        group.add(awning);
        
        return group;
    },
    
    createTower(b, color) {
        const group = new THREE.Group();
        
        const baseGeo = new THREE.CylinderGeometry(b.w / 2, b.w / 2 + 0.5, b.h, 8);
        const baseMat = new THREE.MeshLambertMaterial({ color });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        group.add(base);
        
        // Top
        const topGeo = new THREE.ConeGeometry(b.w / 2 + 1, b.h * 0.3, 8);
        const topMat = new THREE.MeshLambertMaterial({ color: 0x4a0e4e });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = b.h / 2 + b.h * 0.15;
        top.castShadow = true;
        group.add(top);
        
        return group;
    },
    
    createTree(b, color) {
        const group = new THREE.Group();
        
        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, b.h * 0.4, 6);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = -b.h * 0.3;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Leaves - multiple spheres
        const leafMat = new THREE.MeshLambertMaterial({ color });
        for (let i = 0; i < 3; i++) {
            const size = b.w * (1.5 - i * 0.3);
            const leafGeo = new THREE.SphereGeometry(size, 8, 6);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(
                (Math.random() - 0.5) * 1.5,
                b.h * 0.1 + i * 1.5,
                (Math.random() - 0.5) * 1.5
            );
            leaf.castShadow = true;
            group.add(leaf);
        }
        
        return group;
    },
    
    createRock(b, color) {
        const geo = new THREE.DodecahedronGeometry(Math.max(b.w, b.d) / 2, 1);
        const mat = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(1, b.h / b.w, 1);
        mesh.castShadow = true;
        return mesh;
    },
    
    createCrystal(b, color) {
        const group = new THREE.Group();
        const geo = new THREE.OctahedronGeometry(b.w, 0);
        const mat = new THREE.MeshPhongMaterial({ 
            color, 
            emissive: color, 
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(geo, mat);
        crystal.scale.set(1, b.h / b.w, 1);
        group.add(crystal);
        
        // Point light
        const light = new THREE.PointLight(color.getHex ? color.getHex() : parseInt(b.color.replace('#',''), 16), 1, 15);
        light.position.y = b.h / 2;
        group.add(light);
        
        return group;
    },
    
    createWall(b, color) {
        const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const mat = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    },
    
    createPillar(b, color) {
        const group = new THREE.Group();
        const geo = new THREE.CylinderGeometry(b.w / 2, b.w / 2, b.h, 8);
        const mat = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        group.add(mesh);
        
        if (b.type === 'lamp') {
            const lightGeo = new THREE.SphereGeometry(0.5, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
            const lightMesh = new THREE.Mesh(lightGeo, lightMat);
            lightMesh.position.y = b.h / 2 + 0.5;
            group.add(lightMesh);
            
            const pointLight = new THREE.PointLight(0xFFDD88, 0.8, 20);
            pointLight.position.y = b.h / 2 + 0.5;
            group.add(pointLight);
        }
        
        return group;
    },
    
    createPool(b, color) {
        const geo = new THREE.CylinderGeometry(b.w / 2, b.w / 2, b.h, 16);
        const mat = new THREE.MeshPhongMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.7,
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.3
        });
        return new THREE.Mesh(geo, mat);
    },
    
    createThrone(b, color) {
        const group = new THREE.Group();
        
        // Base platform
        const platGeo = new THREE.BoxGeometry(b.w + 4, 2, b.d + 4);
        const platMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const plat = new THREE.Mesh(platGeo, platMat);
        plat.position.y = -b.h / 2 + 1;
        group.add(plat);
        
        // Throne
        const throneGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const throneMat = new THREE.MeshPhongMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 0.2 });
        const throne = new THREE.Mesh(throneGeo, throneMat);
        throne.castShadow = true;
        group.add(throne);
        
        return group;
    },
    
    createBox(b, color) {
        const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const mat = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        return mesh;
    },
    
    createPlayer(region) {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(1.2, 2, 0.8);
        const bodyColor = Game.state ? 
            (World.characters.find(c => c.id === Game.state.characterId) || {}).color || '#ff6b35' :
            '#ff6b35';
        const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.5;
        head.castShadow = true;
        group.add(head);
        
        // Legs
        const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x333366 });
        const legL = new THREE.Mesh(legGeo, legMat);
        legL.position.set(-0.3, -0.1, 0);
        group.add(legL);
        const legR = new THREE.Mesh(legGeo, legMat);
        legR.position.set(0.3, -0.1, 0);
        group.add(legR);
        
        // Arms
        const armGeo = new THREE.BoxGeometry(0.3, 1.4, 0.3);
        const armMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const armL = new THREE.Mesh(armGeo, armMat);
        armL.position.set(-0.9, 0.8, 0);
        group.add(armL);
        const armR = new THREE.Mesh(armGeo, armMat);
        armR.position.set(0.9, 0.8, 0);
        group.add(armR);
        
        // Weapon indicator
        const weapGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        const weapMat = new THREE.MeshPhongMaterial({ 
            color: 0x4ecdc4, 
            emissive: 0x224444, 
            emissiveIntensity: 0.5 
        });
        const weapon = new THREE.Mesh(weapGeo, weapMat);
        weapon.position.set(1.1, 1.2, 0);
        weapon.rotation.z = -0.3;
        weapon.name = 'weapon';
        group.add(weapon);
        
        this.playerMesh = group;
        this.playerPos = { x: 0, y: 0, z: 0 };
        group.position.set(0, 0, 0);
        this.scene.add(group);
    },
    
    createEnemyMeshes(region) {
        this.enemyMeshes = [];
        const completedEnemies = (Game.state && Game.state.completedEnemies) || [];
        
        region.enemies.forEach(enemy => {
            if (completedEnemies.includes(enemy.id)) return;
            
            const group = new THREE.Group();
            
            // Body
            const size = enemy.isBoss ? 3 : 1.5;
            const bodyGeo = new THREE.BoxGeometry(size, size * 1.5, size * 0.8);
            const bodyColor = enemy.isBoss ? 0xff0000 : 0x884488;
            const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = size * 0.75;
            body.castShadow = true;
            group.add(body);
            
            // Eyes
            const eyeGeo = new THREE.SphereGeometry(size * 0.15, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-size * 0.2, size * 1.0, size * 0.35);
            group.add(eyeL);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
            eyeR.position.set(size * 0.2, size * 1.0, size * 0.35);
            group.add(eyeR);
            
            // Boss crown
            if (enemy.isBoss) {
                const crownGeo = new THREE.ConeGeometry(1, 2, 5);
                const crownMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, emissive: 0x886600 });
                const crown = new THREE.Mesh(crownGeo, crownMat);
                crown.position.y = size * 1.8;
                group.add(crown);
            }
            
            // Health bar
            const hpBarGeo = new THREE.PlaneGeometry(size * 1.5, 0.3);
            const hpBarMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
            const hpBar = new THREE.Mesh(hpBarGeo, hpBarMat);
            hpBar.position.y = size * 2.2;
            hpBar.name = 'hpBar';
            group.add(hpBar);
            
            // Name label using sprite
            const canvas2 = document.createElement('canvas');
            canvas2.width = 256;
            canvas2.height = 64;
            const ctx2 = canvas2.getContext('2d');
            ctx2.fillStyle = 'rgba(0,0,0,0.7)';
            ctx2.fillRect(0, 0, 256, 64);
            ctx2.fillStyle = enemy.isBoss ? '#ffd700' : '#ffffff';
            ctx2.font = 'bold 24px Arial';
            ctx2.textAlign = 'center';
            ctx2.fillText(enemy.name, 128, 28);
            ctx2.fillStyle = '#ff6b6b';
            ctx2.font = '18px Arial';
            ctx2.fillText(`م.${enemy.level}`, 128, 52);
            
            const texture = new THREE.CanvasTexture(canvas2);
            const spriteMat = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(4, 1, 1);
            sprite.position.y = size * 2.7;
            group.add(sprite);
            
            group.position.set(enemy.x, 0, enemy.z);
            group.userData = { enemy, originalY: 0 };
            
            this.scene.add(group);
            this.enemyMeshes.push(group);
        });
    },
    
    createNPCMeshes(region) {
        this.npcMeshes = [];
        
        region.npcs.forEach(npc => {
            const group = new THREE.Group();
            
            // Body
            const bodyGeo = new THREE.BoxGeometry(1, 2, 0.7);
            const colors = { elder: 0x8888ff, shopkeeper: 0xDAA520, trainer: 0xff69b4, hermit: 0x6a5acd, professor: 0x4488ff, engineer: 0x44aa44, alchemist: 0xaa44aa, king: 0xffd700, sage: 0xff8888 };
            const bodyMat = new THREE.MeshLambertMaterial({ color: colors[npc.type] || 0x888888 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1;
            body.castShadow = true;
            group.add(body);
            
            // Head
            const headGeo = new THREE.SphereGeometry(0.45, 8, 8);
            const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = 2.3;
            group.add(head);
            
            // Label
            const canvas2 = document.createElement('canvas');
            canvas2.width = 256;
            canvas2.height = 48;
            const ctx2 = canvas2.getContext('2d');
            ctx2.fillStyle = 'rgba(0,0,0,0.7)';
            ctx2.fillRect(0, 0, 256, 48);
            ctx2.fillStyle = '#ffd166';
            ctx2.font = 'bold 22px Arial';
            ctx2.textAlign = 'center';
            ctx2.fillText(npc.name, 128, 32);
            
            const texture = new THREE.CanvasTexture(canvas2);
            const spriteMat = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(4, 1, 1);
            sprite.position.y = 3.2;
            group.add(sprite);
            
            // Interaction indicator
            const indicGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const indicMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
            const indic = new THREE.Mesh(indicGeo, indicMat);
            indic.position.y = 3.8;
            indic.name = 'indicator';
            group.add(indic);
            
            group.position.set(npc.x, 0, npc.z);
            group.userData = { npc };
            
            this.scene.add(group);
            this.npcMeshes.push(group);
        });
    },
    
    createChestMeshes(region) {
        this.chestMeshes = [];
        const openedChests = (Game.state && Game.state.openedChests) || [];
        
        region.chests.forEach(chest => {
            if (openedChests.includes(chest.id)) return;
            
            const group = new THREE.Group();
            
            // Chest body
            const boxGeo = new THREE.BoxGeometry(1.5, 1, 1);
            const boxMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.y = 0.5;
            box.castShadow = true;
            group.add(box);
            
            // Gold trim
            const trimGeo = new THREE.BoxGeometry(1.6, 0.15, 1.1);
            const trimMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, emissive: 0x886600 });
            const trim = new THREE.Mesh(trimGeo, trimMat);
            trim.position.y = 0.6;
            group.add(trim);
            
            // Glow
            const light = new THREE.PointLight(0xFFD700, 0.5, 8);
            light.position.y = 1.5;
            group.add(light);
            
            group.position.set(chest.x, 0, chest.z);
            group.userData = { chest };
            
            this.scene.add(group);
            this.chestMeshes.push(group);
        });
    },
    
    addDecorations(region) {
        // Grass patches
        if (region.type === 'village' || region.type === 'forest') {
            for (let i = 0; i < 50; i++) {
                const size = region.terrain.size / 2;
                const grassGeo = new THREE.PlaneGeometry(0.3, 0.8);
                const grassMat = new THREE.MeshLambertMaterial({ 
                    color: 0x44aa44, 
                    side: THREE.DoubleSide 
                });
                const grass = new THREE.Mesh(grassGeo, grassMat);
                grass.position.set(
                    (Math.random() - 0.5) * size * 1.5,
                    0.4,
                    (Math.random() - 0.5) * size * 1.5
                );
                grass.rotation.y = Math.random() * Math.PI;
                this.scene.add(grass);
            }
        }
        
        // Floating particles for cave
        if (region.type === 'cave') {
            for (let i = 0; i < 30; i++) {
                const particleGeo = new THREE.SphereGeometry(0.1, 4, 4);
                const particleMat = new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0xe040fb : 0x7c4dff 
                });
                const particle = new THREE.Mesh(particleGeo, particleMat);
                particle.position.set(
                    (Math.random() - 0.5) * 80,
                    Math.random() * 15 + 2,
                    (Math.random() - 0.5) * 80
                );
                particle.userData = { 
                    baseY: particle.position.y,
                    speed: Math.random() * 0.5 + 0.2,
                    phase: Math.random() * Math.PI * 2
                };
                this.scene.add(particle);
                this.particles.push(particle);
            }
        }
    },
    
    updatePlayer(delta) {
        if (!this.playerMesh || !Game || Game.mode !== 'explore') return;
        
        const speed = this.isRunning ? this.runSpeed : this.moveSpeed;
        let moveX = 0, moveZ = 0;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
        
        if (moveX !== 0 || moveZ !== 0) {
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= len;
            moveZ /= len;
            
            // Rotate movement by camera angle
            const cos = Math.cos(this.cameraAngleX);
            const sin = Math.sin(this.cameraAngleX);
            const rotX = moveX * cos - moveZ * sin;
            const rotZ = moveX * sin + moveZ * cos;
            
            this.playerPos.x += rotX * speed;
            this.playerPos.z += rotZ * speed;
            
            // Clamp to world bounds
            const region = World.getRegion(this.currentRegionId);
            if (region) {
                const bound = region.terrain.size / 2 - 5;
                this.playerPos.x = Math.max(-bound, Math.min(bound, this.playerPos.x));
                this.playerPos.z = Math.max(-bound, Math.min(bound, this.playerPos.z));
            }
            
            // Rotate player to face movement direction
            this.playerRotation = Math.atan2(rotX, rotZ);
            
            // Walking animation
            this.animTime += delta * (this.isRunning ? 12 : 8);
            this.playerBobOffset = Math.sin(this.animTime) * 0.15;
        } else {
            this.playerBobOffset *= 0.9;
        }
        
        this.playerMesh.position.set(this.playerPos.x, this.playerBobOffset, this.playerPos.z);
        this.playerMesh.rotation.y = this.playerRotation;
    },
    
    updateCamera() {
        if (!this.playerMesh) return;
        
        const px = this.playerPos.x;
        const pz = this.playerPos.z;
        
        const camX = px + Math.sin(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);
        const camY = this.cameraHeight * this.cameraAngleY * 1.5;
        const camZ = pz + Math.cos(this.cameraAngleX) * this.cameraDistance * Math.cos(this.cameraAngleY);
        
        this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        this.camera.lookAt(px, 2, pz);
    },
    
    updateEnemies(delta) {
        this.enemyMeshes.forEach(group => {
            if (!group.userData.enemy) return;
            // Float animation
            group.position.y = Math.sin(Date.now() * 0.002 + group.position.x) * 0.3;
            // Face player
            if (this.playerMesh) {
                const dx = this.playerPos.x - group.position.x;
                const dz = this.playerPos.z - group.position.z;
                group.rotation.y = Math.atan2(dx, dz);
            }
        });
    },
    
    updateNPCs(delta) {
        this.npcMeshes.forEach(group => {
            // Indicator bounce
            const indic = group.getObjectByName('indicator');
            if (indic) {
                indic.position.y = 3.8 + Math.sin(Date.now() * 0.003) * 0.3;
            }
        });
    },
    
    updateParticles(delta) {
        this.particles.forEach(p => {
            p.position.y = p.userData.baseY + Math.sin(Date.now() * 0.001 * p.userData.speed + p.userData.phase) * 2;
            p.position.x += Math.sin(Date.now() * 0.0005 + p.userData.phase) * 0.01;
        });
    },
    
    // Check proximity to interactive objects
    checkProximity() {
        const px = this.playerPos.x;
        const pz = this.playerPos.z;
        const interactDist = 5;
        
        // Check enemies
        for (const group of this.enemyMeshes) {
            const enemy = group.userData.enemy;
            if (!enemy) continue;
            const dx = px - group.position.x;
            const dz = pz - group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < interactDist) {
                return { type: 'enemy', data: enemy, mesh: group };
            }
        }
        
        // Check NPCs
        for (const group of this.npcMeshes) {
            const npc = group.userData.npc;
            if (!npc) continue;
            const dx = px - group.position.x;
            const dz = pz - group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < interactDist) {
                return { type: 'npc', data: npc, mesh: group };
            }
        }
        
        // Check chests
        for (const group of this.chestMeshes) {
            const chest = group.userData.chest;
            if (!chest) continue;
            const dx = px - group.position.x;
            const dz = pz - group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < interactDist) {
                return { type: 'chest', data: chest, mesh: group };
            }
        }
        
        // Check shops
        const region = World.getRegion(this.currentRegionId);
        if (region) {
            for (const b of region.buildings) {
                if (b.type !== 'shop') continue;
                const dx = px - b.x;
                const dz = pz - b.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 8) {
                    return { type: 'shop', data: b };
                }
            }
        }
        
        return null;
    },
    
    removeEnemy(enemyId) {
        const idx = this.enemyMeshes.findIndex(g => g.userData.enemy && g.userData.enemy.id === enemyId);
        if (idx >= 0) {
            const group = this.enemyMeshes[idx];
            this.scene.remove(group);
            this.enemyMeshes.splice(idx, 1);
        }
    },
    
    removeChest(chestId) {
        const idx = this.chestMeshes.findIndex(g => g.userData.chest && g.userData.chest.id === chestId);
        if (idx >= 0) {
            const group = this.chestMeshes[idx];
            this.scene.remove(group);
            this.chestMeshes.splice(idx, 1);
        }
    },
    
    // Update weapon visual
    updateWeaponVisual() {
        if (!this.playerMesh) return;
        const weapon = this.playerMesh.getObjectByName('weapon');
        if (!weapon) return;
        
        const currentWeapon = Game.state ? Game.state.currentWeapon : 0;
        const colors = [0x4ecdc4, 0xff6b6b, 0xa78bfa];
        weapon.material.color.setHex(colors[currentWeapon] || colors[0]);
        weapon.material.emissive.setHex(colors[currentWeapon] || colors[0]);
        weapon.material.emissiveIntensity = 0.3;
    },
    
    // Render minimap
    renderMinimap() {
        const canvas = document.getElementById('minimap');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2);
        ctx.fill();
        
        const region = World.getRegion(this.currentRegionId);
        if (!region) return;
        
        const scale = w / region.terrain.size;
        const cx = w/2 - this.playerPos.x * scale;
        const cy = h/2 - this.playerPos.z * scale;
        
        // Buildings
        ctx.fillStyle = 'rgba(150,150,150,0.5)';
        region.buildings.forEach(b => {
            const bx = cx + b.x * scale;
            const by = cy + b.z * scale;
            ctx.fillRect(bx - 2, by - 2, 4, 4);
        });
        
        // Enemies
        this.enemyMeshes.forEach(g => {
            const e = g.userData.enemy;
            if (!e) return;
            ctx.fillStyle = e.isBoss ? '#ff0000' : '#ff6666';
            const ex = cx + g.position.x * scale;
            const ey = cy + g.position.z * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, e.isBoss ? 4 : 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // NPCs
        this.npcMeshes.forEach(g => {
            ctx.fillStyle = '#ffd166';
            const nx = cx + g.position.x * scale;
            const ny = cy + g.position.z * scale;
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Player
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Direction indicator
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w/2, h/2);
        ctx.lineTo(
            w/2 + Math.sin(this.playerRotation) * 10,
            h/2 + Math.cos(this.playerRotation) * 10
        );
        ctx.stroke();
    },
    
    update() {
        const delta = this.clock.getDelta();
        
        this.updatePlayer(delta);
        this.updateCamera();
        this.updateEnemies(delta);
        this.updateNPCs(delta);
        this.updateParticles(delta);
        
        this.renderer.render(this.scene, this.camera);
    },
    
    // Render battle scene
    renderBattle(playerChar, enemy, playerHpPct, enemyHpPct) {
        const canvas = document.getElementById('battle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1a0a2e');
        grad.addColorStop(1, '#0a0018');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        // Ground
        ctx.fillStyle = '#2a1a3e';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
        
        // Player character
        const pColor = playerChar ? playerChar.color : '#ff6b35';
        ctx.fillStyle = pColor;
        ctx.fillRect(100, h * 0.3, 60, 100);
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(130, h * 0.3 - 15, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Weapon glow
        const weaponId = Game.state ? Game.state.currentWeapon : 0;
        const weapColors = ['#4ecdc4', '#ff6b6b', '#a78bfa'];
        ctx.strokeStyle = weapColors[weaponId];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(160, h * 0.35);
        ctx.lineTo(190, h * 0.25);
        ctx.stroke();
        ctx.shadowColor = weapColors[weaponId];
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Enemy
        const eSize = enemy && enemy.isBoss ? 1.5 : 1;
        ctx.fillStyle = enemy && enemy.isBoss ? '#ff0000' : '#884488';
        ctx.fillRect(w - 200, h * 0.3 - (eSize - 1) * 40, 70 * eSize, 110 * eSize);
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(w - 175, h * 0.3 + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w - 155, h * 0.3 + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Effects
        if (Math.random() > 0.7) {
            ctx.fillStyle = weapColors[weaponId] + '44';
            ctx.beginPath();
            ctx.arc(
                200 + Math.random() * (w - 400),
                h * 0.3 + Math.random() * 100,
                Math.random() * 15 + 5,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    },
    
    // Title screen animation
    renderTitleBackground() {
        const canvas = document.getElementById('title-canvas');
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        
        // Dark gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a0a2e');
        grad.addColorStop(0.5, '#1a1a3e');
        grad.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Animated particles
        const t = Date.now() * 0.001;
        for (let i = 0; i < 60; i++) {
            const x = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(t * 0.2 + i * 2.3) * 0.5 + 0.5) * canvas.height;
            const size = Math.sin(t + i) * 2 + 3;
            const colors = ['#ff6b35', '#4ecdc4', '#a78bfa', '#ffd166', '#ff6b6b'];
            ctx.fillStyle = colors[i % colors.length] + '66';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    }
};
