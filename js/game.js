/* ============================================
   GAME ENGINE - Loop, Movement, Combat, State
   ============================================ */
const Game = {
    canvas: null, ctx: null,
    mode: 'title', // title, explore, battle, dialog, menu
    state: null,
    defaultState: {
        playerName:'Warrior', characterId:'knight', playerLevel:1, xp:0,
        gold:100, keys:0, completedEnemies:[], inventory:{}, achievements:[],
        secretsFound:[], totalCorrect:0, totalQuestions:0, totalPurchases:0,
        bossesDefeated:[], speedAnswers:0, currentMap:'village',
        playerX:14, playerY:18
    },

    // Player state
    player: { x:0, y:0, dir:'down', frame:0, moving:false, moveTimer:0 },
    camera: { x:0, y:0 },
    keys: {},
    currentMap: null,
    mapEnemies: [],
    animFrame: 0,

    // Battle state
    battle: null,
    selectedAnswer: null,
    _timer: null,
    _timerStart: 0,

    // ---- Characters data ----
    characters: [
        { id:'knight', name:'Equation Knight', desc:'Balanced fighter', hp:120, dmg:25, def:10, special:'Shield: block next attack', unlocked:true },
        { id:'mage', name:'Number Mage', desc:'High damage', hp:90, dmg:35, def:5, special:'Double damage next hit', unlocked:true },
        { id:'ranger', name:'Fraction Ranger', desc:'Fast attacker', hp:100, dmg:28, def:8, special:'Free extra attack', unlocked:true },
        { id:'paladin', name:'Geometry Paladin', desc:'Tank with healing', hp:150, dmg:20, def:15, special:'Heal 30% HP', unlocked:true },
    ],
    shopItems: [
        { id:'health_potion', name:'Health Potion', icon:'HP', desc:'Restores 40 HP', price:50, effect:{type:'heal',value:40}, max:5 },
        { id:'super_potion', name:'Super Potion', icon:'SP', desc:'Restores 80 HP', price:120, effect:{type:'heal',value:80}, max:3 },
        { id:'hint_scroll', name:'Hint Scroll', icon:'HS', desc:'Reveals a hint', price:30, effect:{type:'hint'}, max:10 },
        { id:'shield_charm', name:'Shield Charm', icon:'SC', desc:'Block next attack', price:80, effect:{type:'shield'}, max:3 },
        { id:'power_gem', name:'Power Gem', icon:'PG', desc:'Next hit x2 damage', price:100, effect:{type:'power',value:2}, max:3 },
    ],
    achievements: [
        { id:'first_blood', name:'First Blood', desc:'Win your first battle' },
        { id:'combo5', name:'Combo Master', desc:'Get a 5x combo' },
        { id:'speed5', name:'Speed Demon', desc:'5 answers under 5 seconds' },
        { id:'boss_slayer', name:'Boss Slayer', desc:'Defeat a boss' },
        { id:'chest_finder', name:'Chest Finder', desc:'Open a secret chest' },
        { id:'all_forest', name:'Forest Cleared', desc:'Defeat all forest enemies' },
        { id:'all_cave', name:'Cave Cleared', desc:'Defeat all cave enemies' },
        { id:'all_castle', name:'Castle Cleared', desc:'Defeat all castle enemies' },
        { id:'math_genius', name:'Math Genius', desc:'100 correct answers' },
        { id:'game_complete', name:'Champion', desc:'Defeat the Dark Overlord' },
    ],
    xpTable: [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6500,8000,10000],

    // ---- Init ----
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loadState();
        this.setupInput();
        this.renderTitleBg();
        requestAnimationFrame(t => this.loop(t));
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // ---- State ----
    loadState() {
        const s = localStorage.getItem('mathWarriorsState2');
        if (s) { try { this.state = {...this.defaultState, ...JSON.parse(s)}; } catch(e) { this.state = {...this.defaultState}; } }
        else this.state = {...this.defaultState};
    },
    saveState() { localStorage.setItem('mathWarriorsState2', JSON.stringify(this.state)); },
    hasSave() { return !!localStorage.getItem('mathWarriorsState2'); },

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
        this.state.playerName = name || 'Warrior';
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
        // Show HUD
        document.getElementById('hud').classList.remove('hidden');
        this.updateHUD();
        document.getElementById('hud-location').textContent = map.name;
        Sound.resume();
        Sound.playMusic(map.music);
    },

    updateHUD() {
        const s = this.state;
        document.getElementById('hud-name').textContent = s.playerName;
        document.getElementById('hud-level').textContent = `Lv. ${s.playerLevel}`;
        document.getElementById('hud-gold').textContent = s.gold + ' G';
        document.getElementById('hud-keys').textContent = s.keys + ' K';
        document.getElementById('hud-xp').textContent = s.xp + ' XP';
        // HP bar
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
        this.notify('Treasure chest! +1 Key, +50 Gold', 'secret', 4000);
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
            // Arrow indicator
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
        // Check adjacent tiles for interactable stuff
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
            ctx.fillText(npc ? '[SPACE] Talk' : '[Walk] Fight',
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
        document.getElementById('dialog-name').textContent = npc.type.charAt(0).toUpperCase() + npc.type.slice(1);
        document.getElementById('dialog-text').textContent = this.dialogQueue.shift();
        Sound.npcTalk();
    },

    advanceDialog() {
        if (this.dialogQueue.length > 0) {
            document.getElementById('dialog-text').textContent = this.dialogQueue.shift();
            Sound.npcTalk();
        } else {
            document.getElementById('dialog-box').classList.add('hidden');
            // Check for action
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

        // NPC?
        const npc = (map.npcs || []).find(n => n.x === tx && n.y === ty);
        if (npc) { this.startDialog(npc); return; }

        // Sign?
        const tile = Maps.getTile(this.currentMap, tx, ty);
        if (tile === 17) {
            const signs = {
                village: 'Village Square - Forest lies to the south',
                forest: 'Deep Forest - Beware of monsters! Cave entrance ahead.',
                cave: 'Algebra Caverns - Castle beyond.',
                castle: 'Dark Castle - The Overlord awaits.'
            };
            this.startDialog({ type:'Sign', dialog:[signs[this.currentMap] || 'A weathered sign.'], x:tx, y:ty });
        }
    },

    // ---- BATTLE ----
    startBattle(enemyObj) {
        this.mode = 'battle';
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

        // Set up battle UI
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

        // Render question
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

        // Hint button
        const hintBtn = document.getElementById('btn-hint');
        hintBtn.style.display = (this.state.inventory.hint_scroll || 0) > 0 ? 'inline-block' : 'none';

        // Timer
        const limit = b.enemy.difficulty === 'hard' ? 25 : b.enemy.difficulty === 'medium' ? 30 : 35;
        this.startTimer(limit, () => this.processAnswer(false));

        if (isBonus) this.notify('Bonus Problem! Solve for a key!', 'secret', 2000);
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
            this.showBattleMsg(crit ? `CRITICAL! -${dmg} HP` : `-${dmg} HP`, 'green');
            this.shakeScreen();

            if (prob.isBonus) {
                b.keysEarned++;
                this.state.keys++;
                this.notify('You earned a key!', 'secret');
            }

            setTimeout(() => {
                this.updateBattleUI();
                setTimeout(() => this.nextQuestion(), 800);
            }, 600);
        } else {
            b.combo = 0;
            b.wrongAnswers.push({ question: prob.question, correctAnswer: prob.correctAnswer });
            let eDmg = b.shieldActive ? 0 : Math.max(3, b.enemyDmg - b.playerDef);
            if (b.shieldActive) { b.shieldActive = false; this.showBattleMsg('Shield absorbed!', 'cyan'); }
            else { this.showBattleMsg(`Enemy hits! -${eDmg} HP`, 'red'); }
            b.playerHp -= eDmg;
            Sound.hit();
            this.shakeScreen();

            setTimeout(() => {
                this.showBattleMsg(`Answer: ${prob.correctAnswer}`, 'white');
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

        // Victory screen
        document.getElementById('victory-title').textContent = b.enemy.isBoss ? 'Boss Defeated!' : 'Victory!';
        document.getElementById('victory-stars').innerHTML = [1,2,3].map(s =>
            `<span class="${s<=stars?'star-on':'star-off'}">\u2605</span>`).join('');
        document.getElementById('victory-stats').innerHTML = `
            <div class="vs-item"><span class="vs-label">Correct</span><span class="vs-val">${b.correct}/${b.total}</span></div>
            <div class="vs-item"><span class="vs-label">Best Combo</span><span class="vs-val">${b.bestCombo}x</span></div>
            <div class="vs-item"><span class="vs-label">Gold</span><span class="vs-val gold-val">+${gold}</span></div>
            <div class="vs-item"><span class="vs-label">XP</span><span class="vs-val xp-val">+${xp}</span></div>`;
        document.getElementById('victory-rewards').innerHTML = `<h4>Rewards</h4>
            <div>+${gold} Gold, +${xp} XP${b.keysEarned?' ,+'+b.keysEarned+' Key(s)':''}</div>
            ${acc===1?'<div>Perfect Battle Bonus!</div>':''}`;

        if (b.enemy.isFinalBoss) {
            document.getElementById('victory-secret').style.display = 'block';
            document.getElementById('victory-secret').innerHTML = '<h4>Congratulations!</h4><p>You have defeated the Dark Overlord and saved the realm with the power of mathematics!</p>';
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
            html += `<div class="review-item"><div class="review-q">${w.question}</div><div class="review-a">Answer: ${w.correctAnswer}</div></div>`;
        });
        document.getElementById('defeat-review').innerHTML = html || '<p style="color:var(--muted)">You ran out of HP!</p>';
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
        if (q.includes('fraction') || (q.includes('/') && !q.includes('solve'))) return 'Fractions';
        if (q.includes('percent')) return 'Percentages';
        if (q.includes('solve')) return 'Algebra';
        if (q.includes('area') || q.includes('perimeter')) return 'Geometry';
        if (q.includes('angle')) return 'Angles';
        if (q.includes('triangle') || q.includes('hypotenuse')) return 'Pythagoras';
        if (q.includes('mean') || q.includes('median') || q.includes('mode')) return 'Statistics';
        if (q.includes('probability') || q.includes('die') || q.includes('coin') || q.includes('bag')) return 'Probability';
        if (q.includes('\u221A') || q.includes('\u00B2')) return 'Powers & Roots';
        if (q.includes('ratio')) return 'Ratios';
        if (q.includes('bodmas') || (q.includes('(') && q.includes(')'))) return 'BODMAS';
        if (q.includes('if x')) return 'Expressions';
        return 'Arithmetic';
    },

    // ---- Progression ----
    checkLevelUp() {
        let lv = this.state.playerLevel;
        while (lv < this.xpTable.length - 1 && this.state.xp >= this.xpTable[lv]) lv++;
        this.state.playerLevel = lv;
    },

    showLevelUp(lv) {
        const el = document.getElementById('level-up');
        document.getElementById('level-up-text').textContent = `Level ${lv}`;
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
            if (a) this.notify(`Achievement: ${a.name}!`, 'secret', 4000);
        };
        if (s.completedEnemies.length >= 1) unlock('first_blood');
        if (this.battle && this.battle.bestCombo >= 5) unlock('combo5');
        if (s.speedAnswers >= 5) unlock('speed5');
        if (s.bossesDefeated.length >= 1) unlock('boss_slayer');
        if (s.secretsFound.length >= 1) unlock('chest_finder');
        if (s.totalCorrect >= 100) unlock('math_genius');
        // Area clears
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
        if (a) this.notify(`Achievement: ${a.name}!`, 'secret', 4000);
    },

    // ---- Shop ----
    openShop() {
        this.mode = 'menu';
        document.getElementById('shop-gold-display').textContent = this.state.gold + ' Gold';
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';
        this.shopItems.forEach(item => {
            const owned = this.state.inventory[item.id] || 0;
            const canBuy = this.state.gold >= item.price && owned < item.max;
            const card = document.createElement('div');
            card.className = `shop-card ${canBuy ? '' : 'sold-out'}`;
            card.innerHTML = `<div class="shop-icon">${item.icon}</div><h4>${item.name}</h4>
                <p>${item.desc}</p><p style="font-size:.65rem;color:var(--muted)">Owned: ${owned}/${item.max}</p>
                <div class="shop-price">${item.price} G</div>`;
            if (canBuy) card.onclick = () => {
                this.state.gold -= item.price;
                this.state.inventory[item.id] = owned + 1;
                this.state.totalPurchases++;
                this.saveState();
                Sound.confirm();
                this.notify(`Bought ${item.name}!`, 'success');
                this.openShop(); // refresh
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
        if (!has) grid.innerHTML = '<div class="inv-empty">No items yet. Visit the shop in the village!</div>';
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

        // Starfield background
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, c.width, c.height);

        // Gradient
        const g = ctx.createRadialGradient(c.width/2, c.height*0.3, 0, c.width/2, c.height*0.3, c.width*0.6);
        g.addColorStop(0, 'rgba(139,92,246,0.08)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);

        // Math symbols floating
        ctx.fillStyle = 'rgba(139,92,246,0.12)';
        ctx.font = '24px monospace';
        const syms = ['+','-','\u00D7','\u00F7','=','\u03C0','\u221A','\u03A3','\u221E','\u0394','x','y','\u00B2'];
        for (let i = 0; i < 30; i++) {
            ctx.fillText(syms[i % syms.length],
                Math.random() * c.width, Math.random() * c.height);
        }

        // Draw sample characters
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
            card.innerHTML += `<h4>${ch.name}</h4><p>${ch.desc}</p>`;

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
