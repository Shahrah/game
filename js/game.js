/* ============================================
   GAME ENGINE - Loop, Movement, Combat, State
   Arabic UI version with touch controls
   ============================================ */
const Game = {
    canvas: null, ctx: null,
    mode: 'title', // title, explore, battle, dialog, menu
    state: null,
    defaultState: {
        playerName:'\u0645\u062D\u0627\u0631\u0628', characterId:'knight', playerLevel:1, xp:0,
        gold:100, keys:0, completedEnemies:[], inventory:{}, achievements:[],
        secretsFound:[], totalCorrect:0, totalQuestions:0, totalPurchases:0,
        bossesDefeated:[], speedAnswers:0, currentMap:'village',
        playerX:14, playerY:18
    },

    // Player state
    player: { x:0, y:0, dir:'down', frame:0, moving:false, moveTimer:0 },
    camera: { x:0, y:0 },
    keys: {},
    touchDir: null,
    currentMap: null,
    mapEnemies: [],
    animFrame: 0,
    isTouchDevice: false,

    // Battle state
    battle: null,
    selectedAnswer: null,
    _timer: null,
    _timerStart: 0,

    // ---- Characters data ----
    characters: [
        { id:'knight', name:'\u0641\u0627\u0631\u0633 \u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0627\u062A', desc:'\u0645\u0642\u0627\u062A\u0644 \u0645\u062A\u0648\u0627\u0632\u0646', hp:120, dmg:25, def:10, unlocked:true },
        { id:'mage', name:'\u0633\u0627\u062D\u0631 \u0627\u0644\u0623\u0631\u0642\u0627\u0645', desc:'\u0636\u0631\u0631 \u0639\u0627\u0644\u064A', hp:90, dmg:35, def:5, unlocked:true },
        { id:'ranger', name:'\u062D\u0627\u0631\u0633 \u0627\u0644\u0643\u0633\u0648\u0631', desc:'\u0645\u0647\u0627\u062C\u0645 \u0633\u0631\u064A\u0639', hp:100, dmg:28, def:8, unlocked:true },
        { id:'paladin', name:'\u0641\u0627\u0631\u0633 \u0627\u0644\u0647\u0646\u062F\u0633\u0629', desc:'\u062F\u0628\u0627\u0628\u0629 \u0645\u0639 \u0634\u0641\u0627\u0621', hp:150, dmg:20, def:15, unlocked:true },
    ],
    shopItems: [
        { id:'health_potion', name:'\u062C\u0631\u0639\u0629 \u0635\u062D\u0629', icon:'\u2764', desc:'\u062A\u0633\u062A\u0639\u064A\u062F 40 \u0635\u062D\u0629', price:50, effect:{type:'heal',value:40}, max:5 },
        { id:'super_potion', name:'\u062C\u0631\u0639\u0629 \u062E\u0627\u0631\u0642\u0629', icon:'\u2728', desc:'\u062A\u0633\u062A\u0639\u064A\u062F 80 \u0635\u062D\u0629', price:120, effect:{type:'heal',value:80}, max:3 },
        { id:'hint_scroll', name:'\u0644\u0641\u0627\u0641\u0629 \u062A\u0644\u0645\u064A\u062D', icon:'\u2753', desc:'\u062A\u0643\u0634\u0641 \u062A\u0644\u0645\u064A\u062D\u0627\u064B', price:30, effect:{type:'hint'}, max:10 },
        { id:'shield_charm', name:'\u062A\u0639\u0648\u064A\u0630\u0629 \u062F\u0631\u0639', icon:'\u26E8', desc:'\u062A\u0635\u062F \u0627\u0644\u0647\u062C\u0648\u0645 \u0627\u0644\u0642\u0627\u062F\u0645', price:80, effect:{type:'shield'}, max:3 },
        { id:'power_gem', name:'\u062C\u0648\u0647\u0631\u0629 \u0627\u0644\u0642\u0648\u0629', icon:'\u2694', desc:'\u0627\u0644\u0636\u0631\u0628\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629 \u0645\u0636\u0627\u0639\u0641\u0629', price:100, effect:{type:'power',value:2}, max:3 },
    ],
    achievements: [
        { id:'first_blood', name:'\u0627\u0644\u062F\u0645 \u0627\u0644\u0623\u0648\u0644', desc:'\u0627\u0631\u0628\u062D \u0645\u0639\u0631\u0643\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649' },
        { id:'combo5', name:'\u0633\u064A\u062F \u0627\u0644\u0643\u0648\u0645\u0628\u0648', desc:'\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0643\u0648\u0645\u0628\u0648 5x' },
        { id:'speed5', name:'\u0627\u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u062E\u0627\u0631\u0642\u0629', desc:'5 \u0625\u062C\u0627\u0628\u0627\u062A \u0641\u064A \u0623\u0642\u0644 \u0645\u0646 5 \u062B\u0648\u0627\u0646\u064D' },
        { id:'boss_slayer', name:'\u0642\u0627\u062A\u0644 \u0627\u0644\u0632\u0639\u0645\u0627\u0621', desc:'\u0627\u0647\u0632\u0645 \u0632\u0639\u064A\u0645\u0627\u064B' },
        { id:'chest_finder', name:'\u0635\u064A\u0627\u062F \u0627\u0644\u0643\u0646\u0648\u0632', desc:'\u0627\u0641\u062A\u062D \u0635\u0646\u062F\u0648\u0642 \u0643\u0646\u0632' },
        { id:'all_forest', name:'\u062A\u0637\u0647\u064A\u0631 \u0627\u0644\u063A\u0627\u0628\u0629', desc:'\u0627\u0647\u0632\u0645 \u062C\u0645\u064A\u0639 \u0623\u0639\u062F\u0627\u0621 \u0627\u0644\u063A\u0627\u0628\u0629' },
        { id:'all_cave', name:'\u062A\u0637\u0647\u064A\u0631 \u0627\u0644\u0643\u0647\u0641', desc:'\u0627\u0647\u0632\u0645 \u062C\u0645\u064A\u0639 \u0623\u0639\u062F\u0627\u0621 \u0627\u0644\u0643\u0647\u0641' },
        { id:'all_castle', name:'\u062A\u0637\u0647\u064A\u0631 \u0627\u0644\u0642\u0644\u0639\u0629', desc:'\u0627\u0647\u0632\u0645 \u062C\u0645\u064A\u0639 \u0623\u0639\u062F\u0627\u0621 \u0627\u0644\u0642\u0644\u0639\u0629' },
        { id:'math_genius', name:'\u0639\u0628\u0642\u0631\u064A \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A', desc:'100 \u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629' },
        { id:'game_complete', name:'\u0627\u0644\u0628\u0637\u0644', desc:'\u0627\u0647\u0632\u0645 \u0633\u064A\u062F \u0627\u0644\u0638\u0644\u0627\u0645' },
    ],
    xpTable: [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6500,8000,10000],

    // NPC type labels in Arabic
    npcLabels: {
        elder: '\u0627\u0644\u0634\u064A\u062E',
        shopkeeper: '\u0627\u0644\u062A\u0627\u062C\u0631',
        guard: '\u0627\u0644\u062D\u0627\u0631\u0633',
        wizard: '\u0627\u0644\u0633\u0627\u062D\u0631',
        girl: '\u0627\u0644\u0641\u062A\u0627\u0629',
        boy: '\u0627\u0644\u0641\u062A\u0649',
        villager: '\u0642\u0631\u0648\u064A',
        Sign: '\u0644\u0648\u062D\u0629'
    },

    // ---- Init ----
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loadState();
        this.setupInput();
        this.detectTouch();
        this.renderTitleBg();
        requestAnimationFrame(t => this.loop(t));
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    detectTouch() {
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    },

    // ---- State ----
    loadState() {
        const s = localStorage.getItem('mathWarriorsState3');
        if (s) { try { this.state = {...this.defaultState, ...JSON.parse(s)}; } catch(e) { this.state = {...this.defaultState}; } }
        else this.state = {...this.defaultState};
    },
    saveState() { localStorage.setItem('mathWarriorsState3', JSON.stringify(this.state)); },
    hasSave() { return !!localStorage.getItem('mathWarriorsState3'); },

    // ---- Input ----
    setupInput() {
        document.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (this.mode === 'dialog') {
                if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') this.advanceDialog();
            }
            if (this.mode === 'explore') {
                if (e.key === ' ' || e.key === 'e' || e.key === 'E') this.interact();
                if (e.key === 'i' || e.key === 'I') this.openInventory();
            }
            if (this.mode === 'battle') {
                if (['1','2','3','4'].includes(e.key)) {
                    const btns = document.querySelectorAll('.answer-btn');
                    if (btns[parseInt(e.key)-1]) btns[parseInt(e.key)-1].click();
                }
                if (e.key === 'Enter' && this.selectedAnswer !== null) this.submitAnswer();
            }
        });
        document.addEventListener('keyup', e => { this.keys[e.key] = false; });
    },

    // ---- Touch input ----
    setupTouchControls() {
        const dpad = document.querySelectorAll('.touch-dpad .touch-btn[data-dir]');
        dpad.forEach(btn => {
            const dir = btn.getAttribute('data-dir');
            const keyMap = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };

            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                this.keys[keyMap[dir]] = true;
                this.touchDir = dir;
            }, {passive:false});

            btn.addEventListener('touchend', e => {
                e.preventDefault();
                this.keys[keyMap[dir]] = false;
                this.touchDir = null;
            }, {passive:false});

            btn.addEventListener('touchcancel', e => {
                this.keys[keyMap[dir]] = false;
                this.touchDir = null;
            });

            // Mouse fallback for desktop testing
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                this.keys[keyMap[dir]] = true;
            });
            btn.addEventListener('mouseup', e => {
                this.keys[keyMap[dir]] = false;
            });
            btn.addEventListener('mouseleave', e => {
                this.keys[keyMap[dir]] = false;
            });
        });

        // Action button
        const actBtn = document.getElementById('touch-interact');
        if (actBtn) {
            actBtn.addEventListener('touchstart', e => {
                e.preventDefault();
                if (this.mode === 'explore') this.interact();
                if (this.mode === 'dialog') this.advanceDialog();
            }, {passive:false});
            actBtn.addEventListener('click', e => {
                if (this.mode === 'explore') this.interact();
                if (this.mode === 'dialog') this.advanceDialog();
            });
        }

        // Inventory button
        const invBtn = document.getElementById('touch-inventory');
        if (invBtn) {
            invBtn.addEventListener('touchstart', e => {
                e.preventDefault();
                if (this.mode === 'explore') this.openInventory();
            }, {passive:false});
            invBtn.addEventListener('click', e => {
                if (this.mode === 'explore') this.openInventory();
            });
        }
    },

    showTouchControls() {
        const el = document.getElementById('touch-controls');
        if (el) el.classList.remove('hidden');
    },

    hideTouchControls() {
        const el = document.getElementById('touch-controls');
        if (el) el.classList.add('hidden');
    },

    // ---- Overlays ----
    showOverlay(id) { document.getElementById(id).classList.add('active'); },
    hideOverlay(id) { document.getElementById(id).classList.remove('active'); },
    hideAllOverlays() {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
    },

    // ---- Notifications ----
    notify(msg, type='info', dur=3000) {
        const c = document.getElementById('notif-container');
        const n = document.createElement('div');
        n.className = `notif ${type}`;
        n.textContent = msg;
        c.appendChild(n);
        setTimeout(() => { n.classList.add('fade-out'); setTimeout(() => n.remove(), 300); }, dur);
    },

    // ---- Start New Game ----
    startNewGame(name, charId) {
        this.state = {...this.defaultState};
        this.state.playerName = name || '\u0645\u062D\u0627\u0631\u0628';
        this.state.characterId = charId;
        this.saveState();
    },

    // ---- Enter Explore Mode ----
    enterExplore() {
        this.mode = 'explore';
        this.hideAllOverlays();
        const map = Maps.get(this.state.currentMap);
        this.currentMap = this.state.currentMap;
        this.player.x = this.state.playerX;
        this.player.y = this.state.playerY;
        this.player.dir = 'down';
        this.player.frame = 0;
        // Copy enemies that haven't been defeated
        this.mapEnemies = (map.enemies || []).filter(e => !this.state.completedEnemies.includes(e.id)).map(e => ({...e}));
        // Show HUD and touch controls
        document.getElementById('hud').classList.remove('hidden');
        this.updateHUD();
        document.getElementById('hud-location').textContent = map.name;
        this.showTouchControls();
        Sound.resume();
        Sound.playMusic(map.music);
    },

    updateHUD() {
        const s = this.state;
        document.getElementById('hud-name').textContent = s.playerName;
        document.getElementById('hud-level').textContent = '\u0645. ' + s.playerLevel;
        document.getElementById('hud-gold').textContent = s.gold + ' \u0630\u0647\u0628';
        document.getElementById('hud-keys').textContent = s.keys + ' \u0645\u0641\u062A\u0627\u062D';
        document.getElementById('hud-xp').textContent = s.xp + ' \u062E\u0628\u0631\u0629';
        const stats = this.getPlayerStats();
        document.getElementById('hud-hp-fill').style.width = '100%';
    },

    getPlayerStats() {
        const ch = this.characters.find(c => c.id === this.state.characterId) || this.characters[0];
        const lv = this.state.playerLevel;
        return { hp: ch.hp + (lv-1)*10, dmg: ch.dmg + (lv-1)*3, def: ch.def + Math.floor((lv-1)/2) };
    },

    // ---- GAME LOOP ----
    loop(time) {
        this.animFrame++;
        if (this.mode === 'explore') {
            this.updateExplore();
            this.renderExplore();
        }
        requestAnimationFrame(t => this.loop(t));
    },

    // ---- EXPLORE UPDATE ----
    updateExplore() {
        if (this.player.moving) {
            this.player.moveTimer--;
            if (this.player.moveTimer <= 0) this.player.moving = false;
            return;
        }

        let dx = 0, dy = 0;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) { dy = -1; this.player.dir = 'up'; }
        else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) { dy = 1; this.player.dir = 'down'; }
        else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { dx = -1; this.player.dir = 'left'; }
        else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { dx = 1; this.player.dir = 'right'; }

        if (dx === 0 && dy === 0) return;

        const nx = this.player.x + dx;
        const ny = this.player.y + dy;

        // Check exit
        const map = Maps.get(this.currentMap);
        const exit = (map.exits || []).find(e => e.x === nx && e.y === ny);
        if (exit) {
            this.changeMap(exit.toMap, exit.toX, exit.toY);
            Sound.doorOpen();
            return;
        }

        // Check enemy collision
        const enemy = this.mapEnemies.find(e => e.x === nx && e.y === ny);
        if (enemy) {
            this.startBattle(enemy);
            return;
        }

        // Check NPC collision
        const npc = (map.npcs || []).find(n => n.x === nx && n.y === ny);
        if (npc) {
            this.startDialog(npc);
            return;
        }

        // Check walkable
        if (!Maps.isWalkable(this.currentMap, nx, ny)) return;

        // Move
        this.player.x = nx;
        this.player.y = ny;
        this.player.frame++;
        this.player.moving = true;
        this.player.moveTimer = 6;
        this.state.playerX = nx;
        this.state.playerY = ny;

        // Check if standing on chest
        const tile = Maps.getTile(this.currentMap, nx, ny);
        if (tile === 8) {
            this.openChest(nx, ny);
        }

        if (this.animFrame % 3 === 0) Sound.walk();
    },

    changeMap(mapId, px, py) {
        this.state.currentMap = mapId;
        this.state.playerX = px;
        this.state.playerY = py;
        this.currentMap = mapId;
        this.player.x = px;
        this.player.y = py;
        const map = Maps.get(mapId);
        this.mapEnemies = (map.enemies || []).filter(e => !this.state.completedEnemies.includes(e.id)).map(e => ({...e}));
        document.getElementById('hud-location').textContent = map.name;
        Sound.playMusic(map.music);
        this.saveState();
    },

    openChest(x, y) {
        const chestKey = `${this.currentMap}_${x}_${y}`;
        if (this.state.secretsFound.includes(chestKey)) return;
        this.state.secretsFound.push(chestKey);
        this.state.keys++;
        this.state.gold += 50;
        Sound.chest();
        this.notify('\u0635\u0646\u062F\u0648\u0642 \u0643\u0646\u0632! +1 \u0645\u0641\u062A\u0627\u062D, +50 \u0630\u0647\u0628', 'secret', 4000);
        this.checkAchievement('chest_finder');
        this.updateHUD();
        this.saveState();
    },

    // ---- RENDER EXPLORE ----
    renderExplore() {
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const T = Sprites.T;
        const map = Maps.get(this.currentMap);

        // Camera follows player (smooth)
        const targetCX = this.player.x * T - cw / 2 + T / 2;
        const targetCY = this.player.y * T - ch / 2 + T / 2;
        this.camera.x += (targetCX - this.camera.x) * 0.15;
        this.camera.y += (targetCY - this.camera.y) * 0.15;

        // Clamp camera
        this.camera.x = Math.max(0, Math.min(map.width * T - cw, this.camera.x));
        this.camera.y = Math.max(0, Math.min(map.height * T - ch, this.camera.y));

        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, cw, ch);

        // Calculate visible tiles
        const startX = Math.max(0, Math.floor(this.camera.x / T) - 1);
        const startY = Math.max(0, Math.floor(this.camera.y / T) - 1);
        const endX = Math.min(map.width, Math.ceil((this.camera.x + cw) / T) + 1);
        const endY = Math.min(map.height, Math.ceil((this.camera.y + ch) / T) + 1);

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // Draw tiles
        for (let ty = startY; ty < endY; ty++) {
            for (let tx = startX; tx < endX; tx++) {
                const tile = map.tiles[ty][tx];
                Sprites.drawTile(ctx, tx * T, ty * T, tile, this.animFrame);
            }
        }

        // Draw exits (glowing portals)
        (map.exits || []).forEach(e => {
            const pulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(139, 92, 246, ${pulse * 0.3})`;
            ctx.beginPath();
            ctx.arc(e.x * T + T/2, e.y * T + T/2, T/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(139, 92, 246, ${pulse})`;
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(e.y === 0 ? '\u25B2' : '\u25BC', e.x * T + T/2, e.y * T + T/2 + 5);
        });

        // Draw NPCs
        (map.npcs || []).forEach(npc => {
            Sprites.drawNPC(ctx, npc.x * T, npc.y * T, npc.type, npc.dir, Math.floor(this.animFrame / 30));
        });

        // Draw enemies
        this.mapEnemies.forEach(e => {
            Sprites.drawEnemy(ctx, e.x * T, e.y * T, e.type, this.animFrame);
        });

        // Draw player
        Sprites.drawCharacter(ctx, this.player.x * T, this.player.y * T,
            this.state.characterId, this.player.dir, this.player.frame);

        // Draw interaction hint
        this.drawInteractionHint(ctx, T, map);

        ctx.restore();
    },

    drawInteractionHint(ctx, T, map) {
        const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
        const fd = dirs.find(d => {
            if (this.player.dir === 'up' && d.dy === -1) return true;
            if (this.player.dir === 'down' && d.dy === 1) return true;
            if (this.player.dir === 'left' && d.dx === -1) return true;
            if (this.player.dir === 'right' && d.dx === 1) return true;
            return false;
        });
        if (!fd) return;
        const fx = this.player.x + fd.dx;
        const fy = this.player.y + fd.dy;

        const npc = (map.npcs || []).find(n => n.x === fx && n.y === fy);
        const enemy = this.mapEnemies.find(e => e.x === fx && e.y === fy);
        if (npc || enemy) {
            const pulse = Math.sin(Date.now() / 300) * 3;
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(npc ? '\u062A\u062D\u062F\u062B' : '\u0642\u0627\u062A\u0644',
                fx * T + T/2, fy * T - 4 + pulse);
        }
    },

    // ---- DIALOG ----
    dialogQueue: [],
    dialogNPC: null,
    startDialog(npc) {
        this.mode = 'dialog';
        this.dialogNPC = npc;
        this.dialogQueue = [...npc.dialog];
        const box = document.getElementById('dialog-box');
        box.classList.remove('hidden');
        document.getElementById('dialog-name').textContent = this.npcLabels[npc.type] || npc.type;
        document.getElementById('dialog-text').textContent = this.dialogQueue.shift();
        Sound.npcTalk();
    },

    advanceDialog() {
        if (this.dialogQueue.length > 0) {
            document.getElementById('dialog-text').textContent = this.dialogQueue.shift();
            Sound.npcTalk();
        } else {
            document.getElementById('dialog-box').classList.add('hidden');
            if (this.dialogNPC && this.dialogNPC.action === 'shop') {
                this.openShop();
            } else {
                this.mode = 'explore';
            }
            this.dialogNPC = null;
        }
    },

    interact() {
        const dirs = {up:{dx:0,dy:-1},down:{dx:0,dy:1},left:{dx:-1,dy:0},right:{dx:1,dy:0}};
        const d = dirs[this.player.dir];
        const tx = this.player.x + d.dx;
        const ty = this.player.y + d.dy;
        const map = Maps.get(this.currentMap);

        const npc = (map.npcs || []).find(n => n.x === tx && n.y === ty);
        if (npc) { this.startDialog(npc); return; }

        const tile = Maps.getTile(this.currentMap, tx, ty);
        if (tile === 17) {
            const signs = {
                village: '\u0633\u0627\u062D\u0629 \u0627\u0644\u0642\u0631\u064A\u0629 - \u0627\u0644\u063A\u0627\u0628\u0629 \u0641\u064A \u0627\u0644\u062C\u0646\u0648\u0628',
                forest: '\u0627\u0644\u063A\u0627\u0628\u0629 \u0627\u0644\u0639\u0645\u064A\u0642\u0629 - \u0627\u062D\u0630\u0631 \u0645\u0646 \u0627\u0644\u0648\u062D\u0648\u0634! \u0645\u062F\u062E\u0644 \u0627\u0644\u0643\u0647\u0641 \u0642\u0631\u064A\u0628.',
                cave: '\u0643\u0647\u0648\u0641 \u0627\u0644\u062C\u0628\u0631 - \u0627\u0644\u0642\u0644\u0639\u0629 \u0641\u064A \u0627\u0644\u0623\u0645\u0627\u0645.',
                castle: '\u0627\u0644\u0642\u0644\u0639\u0629 \u0627\u0644\u0645\u0638\u0644\u0645\u0629 - \u0633\u064A\u062F \u0627\u0644\u0638\u0644\u0627\u0645 \u064A\u0646\u062A\u0638\u0631.'
            };
            this.startDialog({ type:'Sign', dialog:[signs[this.currentMap] || '\u0644\u0648\u062D\u0629 \u0642\u062F\u064A\u0645\u0629.'], x:tx, y:ty });
        }
    },

    // ---- BATTLE ----
    startBattle(enemyObj) {
        this.mode = 'battle';
        this.hideTouchControls();
        Sound.stopMusic();
        Sound.playMusic(enemyObj.isBoss ? 'boss' : 'battle');

        const stats = this.getPlayerStats();
        this.battle = {
            enemy: enemyObj,
            playerHp: stats.hp, playerMaxHp: stats.hp,
            playerDmg: stats.dmg, playerDef: stats.def,
            enemyHp: enemyObj.enemyData.hp, enemyMaxHp: enemyObj.enemyData.hp,
            enemyDmg: enemyObj.enemyData.damage, enemyDef: enemyObj.enemyData.defense,
            combo: 0, bestCombo: 0, correct: 0, total: 0,
            wrongAnswers: [], specialCharge: 0, specialMax: 5,
            shieldActive: false, powerMult: 1, keysEarned: 0,
            speedAnswers: 0, currentProblem: null, active: true,
        };
        this.selectedAnswer = null;

        document.getElementById('bf-player-name').textContent = this.state.playerName;
        document.getElementById('bf-enemy-name').textContent = enemyObj.enemyData.name;
        this.updateBattleUI();
        this.showOverlay('screen-battle');
        setTimeout(() => this.nextQuestion(), 500);
    },

    updateBattleUI() {
        const b = this.battle;
        document.getElementById('bf-player-hp').style.width = Math.max(0, b.playerHp / b.playerMaxHp * 100) + '%';
        document.getElementById('bf-player-hp-text').textContent = `${Math.max(0,Math.round(b.playerHp))}/${b.playerMaxHp}`;
        document.getElementById('bf-enemy-hp').style.width = Math.max(0, b.enemyHp / b.enemyMaxHp * 100) + '%';
        document.getElementById('bf-enemy-hp-text').textContent = `${Math.max(0,Math.round(b.enemyHp))}/${b.enemyMaxHp}`;
        document.getElementById('bf-special-fill').style.width = Math.min(100, b.specialCharge / b.specialMax * 100) + '%';
        if (b.combo > 1) {
            document.getElementById('battle-combo').style.display = 'block';
            document.getElementById('combo-num').textContent = b.combo;
        } else {
            document.getElementById('battle-combo').style.display = 'none';
        }
    },

    nextQuestion() {
        const b = this.battle;
        if (!b || !b.active) return;
        if (b.enemyHp <= 0) { this.battleVictory(); return; }
        if (b.playerHp <= 0) { this.battleDefeat(); return; }

        const isBonus = Math.random() < 0.12;
        const prob = isBonus
            ? MathEngine.generateBonusProblem(b.enemy.topics)
            : MathEngine.generateProblem(b.enemy.topics, b.enemy.difficulty);
        b.currentProblem = prob;
        b.total++;
        this.selectedAnswer = null;

        document.getElementById('bq-category').textContent = this.getCatLabel(prob);
        document.getElementById('bq-text').textContent = prob.question;
        document.getElementById('bq-hint').style.display = 'none';
        const answersDiv = document.getElementById('bq-answers');
        answersDiv.innerHTML = '';
        prob.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                answersDiv.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedAnswer = String(opt);
                document.getElementById('btn-submit').disabled = false;
            };
            answersDiv.appendChild(btn);
        });
        document.getElementById('btn-submit').disabled = true;

        const hintBtn = document.getElementById('btn-hint');
        hintBtn.style.display = (this.state.inventory.hint_scroll || 0) > 0 ? 'inline-block' : 'none';

        const limit = b.enemy.difficulty === 'hard' ? 25 : b.enemy.difficulty === 'medium' ? 30 : 35;
        this.startTimer(limit, () => this.processAnswer(false));

        if (isBonus) this.notify('\u0633\u0624\u0627\u0644 \u0625\u0636\u0627\u0641\u064A! \u062D\u0644\u0647 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0641\u062A\u0627\u062D!', 'secret', 2000);
    },

    submitAnswer() {
        if (!this.battle || !this.battle.active || this.selectedAnswer === null) return;
        this.stopTimer();
        const elapsed = (Date.now() - this._timerStart) / 1000;
        const correct = String(this.selectedAnswer).trim() === String(this.battle.currentProblem.correctAnswer).trim();
        this.processAnswer(correct, elapsed);
    },

    processAnswer(correct, elapsed = 999) {
        const b = this.battle;
        const prob = b.currentProblem;
        const btns = document.querySelectorAll('.answer-btn');

        btns.forEach(btn => {
            btn.onclick = null;
            if (String(btn.textContent) === String(prob.correctAnswer)) btn.classList.add('correct');
            if (btn.classList.contains('selected') && !correct) btn.classList.add('wrong');
        });

        if (correct) {
            b.correct++;
            b.combo++;
            if (b.combo > b.bestCombo) b.bestCombo = b.combo;
            b.specialCharge = Math.min(b.specialMax, b.specialCharge + 1);

            let dmg = b.playerDmg + b.combo * 3;
            const speed = elapsed < 5;
            if (speed) { dmg = Math.floor(dmg * 1.3); b.speedAnswers++; }
            dmg = Math.floor(dmg * b.powerMult);
            b.powerMult = 1;
            dmg = Math.max(5, dmg - b.enemyDef);
            const crit = Math.random() < (0.1 + b.combo * 0.03);
            if (crit) dmg = Math.floor(dmg * 1.8);

            b.enemyHp -= dmg;
            Sound.attack();
            if (b.combo >= 3) Sound.combo();
            this.showBattleMsg(crit ? `\u0636\u0631\u0628\u0629 \u062D\u0631\u062C\u0629! -${dmg}` : `-${dmg} \u0635\u062D\u0629`, 'green');
            this.shakeScreen();

            if (prob.isBonus) {
                b.keysEarned++;
                this.state.keys++;
                this.notify('\u062D\u0635\u0644\u062A \u0639\u0644\u0649 \u0645\u0641\u062A\u0627\u062D!', 'secret');
            }

            setTimeout(() => {
                this.updateBattleUI();
                setTimeout(() => this.nextQuestion(), 800);
            }, 600);
        } else {
            b.combo = 0;
            b.wrongAnswers.push({ question: prob.question, correctAnswer: prob.correctAnswer });
            let eDmg = b.shieldActive ? 0 : Math.max(3, b.enemyDmg - b.playerDef);
            if (b.shieldActive) { b.shieldActive = false; this.showBattleMsg('\u0627\u0644\u062F\u0631\u0639 \u0627\u0645\u062A\u0635 \u0627\u0644\u0636\u0631\u0628\u0629!', 'cyan'); }
            else { this.showBattleMsg(`\u0627\u0644\u0639\u062F\u0648 \u0636\u0631\u0628\u0643! -${eDmg}`, 'red'); }
            b.playerHp -= eDmg;
            Sound.hit();
            this.shakeScreen();

            setTimeout(() => {
                this.showBattleMsg(`\u0627\u0644\u062C\u0648\u0627\u0628: ${prob.correctAnswer}`, 'white');
                this.updateBattleUI();
                setTimeout(() => this.nextQuestion(), 1500);
            }, 800);
        }
    },

    battleVictory() {
        this.battle.active = false;
        this.stopTimer();
        Sound.stopMusic();
        Sound.victory();
        this.hideOverlay('screen-battle');

        const b = this.battle;
        const acc = b.correct / Math.max(1, b.total);
        const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
        let gold = 30 + b.correct * 5;
        let xp = b.correct * 20 + b.bestCombo * 5;
        if (b.enemy.isBoss) { gold *= 3; xp *= 2; }
        if (acc === 1) gold += 50;

        this.state.gold += gold;
        this.state.xp += xp;
        this.state.totalCorrect += b.correct;
        this.state.totalQuestions += b.total;
        this.state.speedAnswers += b.speedAnswers;
        this.state.completedEnemies.push(b.enemy.id);
        if (b.enemy.isBoss) this.state.bossesDefeated.push(b.enemy.id);
        this.mapEnemies = this.mapEnemies.filter(e => e.id !== b.enemy.id);

        const oldLv = this.state.playerLevel;
        this.checkLevelUp();
        const leveled = this.state.playerLevel > oldLv;
        this.checkAllAchievements();
        this.saveState();

        document.getElementById('victory-title').textContent = b.enemy.isBoss ? '\u062A\u0645 \u0647\u0632\u064A\u0645\u0629 \u0627\u0644\u0632\u0639\u064A\u0645!' : '\u0627\u0646\u062A\u0635\u0627\u0631!';
        document.getElementById('victory-stars').innerHTML = [1,2,3].map(s =>
            `<span class="${s<=stars?'star-on':'star-off'}">\u2605</span>`).join('');
        document.getElementById('victory-stats').innerHTML = `
            <div class="vs-item"><span class="vs-label">\u0635\u062D\u064A\u062D</span><span class="vs-val">${b.correct}/${b.total}</span></div>
            <div class="vs-item"><span class="vs-label">\u0623\u0641\u0636\u0644 \u0643\u0648\u0645\u0628\u0648</span><span class="vs-val">${b.bestCombo}x</span></div>
            <div class="vs-item"><span class="vs-label">\u0630\u0647\u0628</span><span class="vs-val gold-val">+${gold}</span></div>
            <div class="vs-item"><span class="vs-label">\u062E\u0628\u0631\u0629</span><span class="vs-val xp-val">+${xp}</span></div>`;
        document.getElementById('victory-rewards').innerHTML = `<h4>\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A</h4>
            <div>+${gold} \u0630\u0647\u0628, +${xp} \u062E\u0628\u0631\u0629${b.keysEarned?' ,+'+b.keysEarned+' \u0645\u0641\u062A\u0627\u062D':''}</div>
            ${acc===1?'<div>\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0645\u0639\u0631\u0643\u0629 \u0627\u0644\u0645\u062B\u0627\u0644\u064A\u0629!</div>':''}`;

        if (b.enemy.isFinalBoss) {
            document.getElementById('victory-secret').style.display = 'block';
            document.getElementById('victory-secret').innerHTML = '<h4>\u062A\u0647\u0627\u0646\u064A\u0646\u0627!</h4><p>\u0644\u0642\u062F \u0647\u0632\u0645\u062A \u0633\u064A\u062F \u0627\u0644\u0638\u0644\u0627\u0645 \u0648\u0623\u0646\u0642\u0630\u062A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0628\u0642\u0648\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A!</p>';
        } else {
            document.getElementById('victory-secret').style.display = 'none';
        }

        this.showOverlay('screen-victory');
        if (leveled) this.showLevelUp(this.state.playerLevel);
    },

    battleDefeat() {
        this.battle.active = false;
        this.stopTimer();
        Sound.stopMusic();
        Sound.defeat();
        this.hideOverlay('screen-battle');

        const b = this.battle;
        this.state.xp += b.correct * 5;
        this.state.totalCorrect += b.correct;
        this.state.totalQuestions += b.total;
        this.saveState();

        let html = '';
        b.wrongAnswers.forEach(w => {
            html += `<div class="review-item"><div class="review-q">${w.question}</div><div class="review-a">\u0627\u0644\u062C\u0648\u0627\u0628: ${w.correctAnswer}</div></div>`;
        });
        document.getElementById('defeat-review').innerHTML = html || '<p style="color:var(--muted)">\u0646\u0641\u062F\u062A \u0635\u062D\u062A\u0643!</p>';
        this.showOverlay('screen-defeat');
    },

    // ---- Timer ----
    startTimer(seconds, onExpire) {
        this.stopTimer();
        let rem = seconds;
        const el = document.getElementById('bq-timer');
        el.textContent = rem;
        el.classList.remove('urgent');
        this._timerStart = Date.now();
        this._timer = setInterval(() => {
            rem--;
            el.textContent = rem;
            if (rem <= 5) el.classList.add('urgent');
            if (rem <= 0) { this.stopTimer(); onExpire(); }
        }, 1000);
    },
    stopTimer() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },

    // ---- Battle helpers ----
    showBattleMsg(text, color) {
        const el = document.getElementById('battle-msg');
        el.textContent = text;
        el.style.display = 'block';
        el.style.color = color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : color === 'cyan' ? '#06b6d4' : '#e8ecf4';
        setTimeout(() => { el.style.display = 'none'; }, 1200);
    },

    shakeScreen() {
        this.canvas.classList.add('shake');
        setTimeout(() => this.canvas.classList.remove('shake'), 300);
    },

    useHint() {
        if (!this.battle || !this.battle.currentProblem) return;
        if ((this.state.inventory.hint_scroll || 0) <= 0) return;
        this.state.inventory.hint_scroll--;
        document.getElementById('bq-hint').textContent = this.battle.currentProblem.hint;
        document.getElementById('bq-hint').style.display = 'block';
        this.saveState();
    },

    getCatLabel(p) {
        const q = p.question.toLowerCase();
        if (q.includes('fraction') || q.includes('\u0643\u0633\u0631') || (q.includes('/') && !q.includes('solve') && !q.includes('\u062D\u0644'))) return '\u0643\u0633\u0648\u0631';
        if (q.includes('percent') || q.includes('%')) return '\u0646\u0633\u0628 \u0645\u0626\u0648\u064A\u0629';
        if (q.includes('solve') || q.includes('\u062D\u0644') || q.includes('\u0623\u0648\u062C\u062F x')) return '\u062C\u0628\u0631';
        if (q.includes('area') || q.includes('perimeter') || q.includes('\u0645\u0633\u0627\u062D\u0629') || q.includes('\u0645\u062D\u064A\u0637')) return '\u0647\u0646\u062F\u0633\u0629';
        if (q.includes('angle') || q.includes('\u0632\u0627\u0648\u064A\u0629')) return '\u0632\u0648\u0627\u064A\u0627';
        if (q.includes('triangle') || q.includes('hypotenuse') || q.includes('\u0645\u062B\u0644\u062B') || q.includes('\u0648\u062A\u0631')) return '\u0641\u064A\u062B\u0627\u063A\u0648\u0631\u0633';
        if (q.includes('mean') || q.includes('median') || q.includes('mode') || q.includes('\u0645\u062A\u0648\u0633\u0637') || q.includes('\u0648\u0633\u064A\u0637')) return '\u0625\u062D\u0635\u0627\u0621';
        if (q.includes('probability') || q.includes('\u0627\u062D\u062A\u0645\u0627\u0644') || q.includes('\u0646\u0631\u062F') || q.includes('\u0639\u0645\u0644\u0629')) return '\u0627\u062D\u062A\u0645\u0627\u0644\u0627\u062A';
        if (q.includes('\u221A') || q.includes('\u00B2') || q.includes('\u062C\u0630\u0631') || q.includes('\u0623\u0633')) return '\u0642\u0648\u0649 \u0648\u062C\u0630\u0648\u0631';
        if (q.includes('ratio') || q.includes('\u0646\u0633\u0628\u0629')) return '\u0646\u0633\u0628';
        if (q.includes('bodmas') || q.includes('\u0623\u0648\u0644\u0648\u064A\u0629') || (q.includes('(') && q.includes(')'))) return '\u0623\u0648\u0644\u0648\u064A\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A';
        if (q.includes('if x') || q.includes('\u0625\u0630\u0627 \u0643\u0627\u0646')) return '\u062A\u0639\u0628\u064A\u0631\u0627\u062A';
        return '\u062D\u0633\u0627\u0628';
    },

    // ---- Progression ----
    checkLevelUp() {
        let lv = this.state.playerLevel;
        while (lv < this.xpTable.length - 1 && this.state.xp >= this.xpTable[lv]) lv++;
        this.state.playerLevel = lv;
    },

    showLevelUp(lv) {
        const el = document.getElementById('level-up');
        document.getElementById('level-up-text').textContent = '\u0645\u0633\u062A\u0648\u0649 ' + lv;
        el.classList.remove('hidden');
        Sound.levelUp();
        setTimeout(() => el.classList.add('hidden'), 2500);
    },

    // ---- Achievements ----
    checkAllAchievements() {
        const s = this.state;
        const unlock = id => {
            if (s.achievements.includes(id)) return;
            s.achievements.push(id);
            const a = this.achievements.find(a => a.id === id);
            if (a) this.notify('\u0625\u0646\u062C\u0627\u0632: ' + a.name + '!', 'secret', 4000);
        };
        if (s.completedEnemies.length >= 1) unlock('first_blood');
        if (this.battle && this.battle.bestCombo >= 5) unlock('combo5');
        if (s.speedAnswers >= 5) unlock('speed5');
        if (s.bossesDefeated.length >= 1) unlock('boss_slayer');
        if (s.secretsFound.length >= 1) unlock('chest_finder');
        if (s.totalCorrect >= 100) unlock('math_genius');
        const forestEnemies = Maps.forest.enemies.map(e => e.id);
        if (forestEnemies.every(id => s.completedEnemies.includes(id))) unlock('all_forest');
        const caveEnemies = Maps.cave.enemies.map(e => e.id);
        if (caveEnemies.every(id => s.completedEnemies.includes(id))) unlock('all_cave');
        const castleEnemies = Maps.castle.enemies.map(e => e.id);
        if (castleEnemies.every(id => s.completedEnemies.includes(id))) unlock('all_castle');
        if (s.completedEnemies.includes('e_final')) unlock('game_complete');
    },

    checkAchievement(id) {
        if (this.state.achievements.includes(id)) return;
        this.state.achievements.push(id);
        const a = this.achievements.find(a => a.id === id);
        if (a) this.notify('\u0625\u0646\u062C\u0627\u0632: ' + a.name + '!', 'secret', 4000);
    },

    // ---- Shop ----
    openShop() {
        this.mode = 'menu';
        document.getElementById('shop-gold-display').textContent = this.state.gold + ' \u0630\u0647\u0628';
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';
        this.shopItems.forEach(item => {
            const owned = this.state.inventory[item.id] || 0;
            const canBuy = this.state.gold >= item.price && owned < item.max;
            const card = document.createElement('div');
            card.className = `shop-card ${canBuy ? '' : 'sold-out'}`;
            card.innerHTML = `<div class="shop-icon">${item.icon}</div><h4>${item.name}</h4>
                <p>${item.desc}</p><p style="font-size:.65rem;color:var(--muted)">\u0645\u0645\u0644\u0648\u0643: ${owned}/${item.max}</p>
                <div class="shop-price">${item.price} \u0630\u0647\u0628</div>`;
            if (canBuy) card.onclick = () => {
                this.state.gold -= item.price;
                this.state.inventory[item.id] = owned + 1;
                this.state.totalPurchases++;
                this.saveState();
                Sound.confirm();
                this.notify('\u0627\u0634\u062A\u0631\u064A\u062A ' + item.name + '!', 'success');
                this.openShop();
            };
            grid.appendChild(card);
        });
        this.showOverlay('screen-shop');
    },

    closeShop() {
        this.hideOverlay('screen-shop');
        this.mode = 'explore';
        this.updateHUD();
    },

    // ---- Inventory ----
    openInventory() {
        this.mode = 'menu';
        const grid = document.getElementById('inv-grid');
        grid.innerHTML = '';
        let has = false;
        Object.entries(this.state.inventory).forEach(([id, count]) => {
            if (count <= 0) return;
            has = true;
            const item = this.shopItems.find(i => i.id === id);
            if (!item) return;
            const card = document.createElement('div');
            card.className = 'inv-card';
            card.innerHTML = `<div class="inv-icon">${item.icon}</div><h4>${item.name}</h4><div class="inv-count">x${count}</div>`;
            grid.appendChild(card);
        });
        if (!has) grid.innerHTML = '<div class="inv-empty">\u0644\u0627 \u0639\u0646\u0627\u0635\u0631 \u0628\u0639\u062F. \u0632\u0631 \u0627\u0644\u0645\u062A\u062C\u0631 \u0641\u064A \u0627\u0644\u0642\u0631\u064A\u0629!</div>';
        this.showOverlay('screen-inventory');
    },

    closeInventory() {
        this.hideOverlay('screen-inventory');
        this.mode = 'explore';
    },

    // ---- Title background ----
    renderTitleBg() {
        const c = document.getElementById('title-canvas');
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, c.width, c.height);

        const g = ctx.createRadialGradient(c.width/2, c.height*0.3, 0, c.width/2, c.height*0.3, c.width*0.6);
        g.addColorStop(0, 'rgba(139,92,246,0.08)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = 'rgba(139,92,246,0.12)';
        ctx.font = '24px monospace';
        const syms = ['+','-','\u00D7','\u00F7','=','\u03C0','\u221A','\u03A3','\u221E','\u0394','x','y','\u00B2'];
        for (let i = 0; i < 30; i++) {
            ctx.fillText(syms[i % syms.length],
                Math.random() * c.width, Math.random() * c.height);
        }

        const cx = c.width / 2;
        Sprites.drawCharacter(ctx, cx - 80, c.height * 0.65, 'knight', 'down', 0, 2);
        Sprites.drawCharacter(ctx, cx - 20, c.height * 0.63, 'mage', 'down', 0, 2);
        Sprites.drawCharacter(ctx, cx + 40, c.height * 0.65, 'ranger', 'down', 1, 2);
        Sprites.drawEnemy(ctx, cx + 120, c.height * 0.64, 'dragon', 0);
        Sprites.drawEnemy(ctx, cx - 140, c.height * 0.66, 'skeleton', 0);
    },

    // ---- Character Select ----
    renderCharSelect() {
        const grid = document.getElementById('char-grid');
        grid.innerHTML = '';
        this.selectedCharId = null;
        this.characters.forEach(ch => {
            const card = document.createElement('div');
            card.className = `char-card ${ch.unlocked ? '' : 'locked'}`;

            // Mini canvas for character preview
            const miniC = document.createElement('canvas');
            miniC.width = 48; miniC.height = 48;
            const mctx = miniC.getContext('2d');
            mctx.imageSmoothingEnabled = false;
            Sprites.drawCharacter(mctx, 8, 8, ch.id, 'down', 0);

            const av = document.createElement('div');
            av.className = 'char-avatar';
            av.appendChild(miniC);
            card.appendChild(av);

            // Use DOM methods instead of innerHTML+= to preserve canvas
            const nameEl = document.createElement('h4');
            nameEl.textContent = ch.name;
            card.appendChild(nameEl);

            const descEl = document.createElement('p');
            descEl.textContent = ch.desc;
            card.appendChild(descEl);

            if (ch.unlocked) {
                card.onclick = () => {
                    grid.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedCharId = ch.id;
                    document.getElementById('btn-start').disabled = false;
                    Sound.select();
                };
            }
            grid.appendChild(card);
        });
    }
};
