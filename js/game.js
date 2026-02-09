/* ============================================
   GAME LOGIC - State, Battles, Progression
   ============================================ */

const Game = {
    mode: 'title',
    state: null,
    defaultState: {
        playerName: 'محارب العلوم',
        characterId: 'warrior',
        grade: 1,
        playerLevel: 1,
        xp: 0,
        maxHp: 120,
        currentHp: 120,
        gold: 100,
        keys: 0,
        stars: 0,
        currentRegion: 'village',
        currentWeapon: 0,
        completedEnemies: [],
        openedChests: [],
        inventory: {},
        unlockedRegions: ['village'],
        unlockedWeapons: [0],
        weaponDamage: [25, 30, 35],
        totalCorrect: 0,
        totalQuestions: 0,
        bossesDefeated: [],
        achievements: [],
    },

    battle: null,
    selectedAnswer: null,
    battleTimer: null,
    battleTimeLeft: 0,
    combo: 0,
    dialogQueue: [],
    dialogCallback: null,
    _selectedMapRegion: null,

    xpTable: [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6500,8000,10000,12000,15000,18000,22000,27000],

    init() {
        this.loadState();
        this.setupUIEvents();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('scienceBattle3D_save');
            if (saved) {
                this.state = { ...this.defaultState, ...JSON.parse(saved) };
                const btnContinue = document.getElementById('btn-continue');
                if (btnContinue) btnContinue.style.display = 'block';
            }
        } catch (e) {}
    },

    saveState() {
        if (!this.state) return;
        try { localStorage.setItem('scienceBattle3D_save', JSON.stringify(this.state)); } catch(e) {}
    },

    newGame(name, characterId, grade) {
        this.state = { ...this.defaultState };
        this.state.playerName = name || 'محارب العلوم';
        this.state.characterId = characterId;
        this.state.grade = grade;
        const char = World.characters.find(c => c.id === characterId);
        if (char) {
            this.state.maxHp = char.hp;
            this.state.currentHp = char.hp;
            this.state.weaponDamage[0] = char.dmg;
        }
        this.saveState();
        this.startExploring('village');
    },

    continueGame() {
        if (!this.state) return;
        this.startExploring(this.state.currentRegion);
    },

    startExploring(regionId) {
        this.mode = 'explore';
        this.state.currentRegion = regionId;
        this.saveState();
        this.showScreen('screen-loading');
        const tip = document.getElementById('loading-tip');
        if (tip) tip.textContent = World.getRandomTip();
        let progress = 0;
        const loadingFill = document.getElementById('loading-fill');
        const loadInterval = setInterval(() => {
            progress += Math.random() * 20 + 10;
            if (loadingFill) loadingFill.style.width = Math.min(progress, 100) + '%';
            if (progress >= 100) {
                clearInterval(loadInterval);
                setTimeout(() => {
                    Engine3D.loadRegion(regionId);
                    this.updateHUD();
                    document.getElementById('hud').classList.remove('hidden');
                    document.getElementById('crosshair').classList.remove('hidden');
                    const minimap = document.getElementById('minimap');
                    if (minimap) minimap.classList.add('visible');
                    this.hideAllScreens();
                    Engine3D.updateWeaponVisual();
                    const region = World.getRegion(regionId);
                    if (region && region.unlocksWeapon !== undefined) {
                        if (!this.state.unlockedWeapons.includes(region.unlocksWeapon)) {
                            this.state.unlockedWeapons.push(region.unlocksWeapon);
                            const weapon = World.getWeapon(region.unlocksWeapon);
                            if (weapon) {
                                this.notify('تم فتح ' + weapon.name + '!', 'success');
                                this.updateWeaponSlots();
                            }
                            this.saveState();
                        }
                    }
                    if (region) {
                        this.notify(region.name, 'info');
                        const locEl = document.getElementById('hud-location');
                        if (locEl) locEl.textContent = region.name;
                    }
                }, 300);
            }
        }, 100);
    },

    setupUIEvents() {
        document.getElementById('btn-new-game').addEventListener('click', () => {
            this.showScreen('screen-charselect');
            this.renderCharacterSelect();
        });
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) btnContinue.addEventListener('click', () => this.continueGame());
        document.getElementById('btn-how-to-play').addEventListener('click', () => this.showScreen('screen-tutorial'));
        document.getElementById('btn-tut-back').addEventListener('click', () => this.showScreen('screen-title'));
        const btnWorldMap = document.getElementById('btn-world-map');
        if (btnWorldMap) btnWorldMap.addEventListener('click', () => this.showWorldMap());

        document.getElementById('btn-start').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name');
            const name = nameInput.value.trim() || 'محارب العلوم';
            const selectedChar = document.querySelector('.char-card.selected');
            if (!selectedChar) return;
            const charId = selectedChar.dataset.charId;
            const activeGrade = document.querySelector('.diff-btn.active');
            const grade = activeGrade ? parseInt(activeGrade.dataset.grade) : 1;
            this.newGame(name, charId, grade);
        });

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('sound-toggle').addEventListener('click', () => {
            Sound.toggle();
            document.getElementById('sound-toggle').textContent = Sound.enabled ? '🔊 الصوت' : '🔇 الصوت';
        });

        document.getElementById('btn-submit').addEventListener('click', () => this.submitAnswer());
        document.getElementById('btn-hint').addEventListener('click', () => this.useHint());
        document.getElementById('btn-victory-continue').addEventListener('click', () => {
            this.hideAllScreens();
            this.mode = 'explore';
        });
        document.getElementById('btn-retry').addEventListener('click', () => {
            if (this.battle) this.startBattle(this.battle.enemy);
        });
        document.getElementById('btn-retreat').addEventListener('click', () => {
            this.hideAllScreens();
            this.state.currentHp = Math.max(this.state.currentHp, 30);
            this.saveState();
            this.mode = 'explore';
        });
        const btnShopClose = document.getElementById('btn-shop-close');
        if (btnShopClose) btnShopClose.addEventListener('click', () => { this.hideAllScreens(); this.mode = 'explore'; });
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderShop(tab.dataset.tab);
            });
        });
        const btnMapClose = document.getElementById('btn-map-close');
        if (btnMapClose) btnMapClose.addEventListener('click', () => {
            if (this.mode === 'explore') this.hideAllScreens();
            else this.showScreen('screen-title');
        });
        const btnTravel = document.getElementById('btn-travel');
        if (btnTravel) btnTravel.addEventListener('click', () => {
            const selected = this._selectedMapRegion;
            if (selected && this.state && this.state.unlockedRegions.includes(selected)) this.startExploring(selected);
        });
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotNum = parseInt(slot.dataset.slot);
                if (this.state && this.state.unlockedWeapons.includes(slotNum)) {
                    this.state.currentWeapon = slotNum;
                    this.updateWeaponSlots();
                    Engine3D.updateWeaponVisual();
                    Sound.play('select');
                }
            });
        });
        document.addEventListener('keydown', (e) => {
            if (this.mode === 'explore') {
                if (e.code === 'KeyE' || e.code === 'Space') this.interact();
                if (e.code === 'Tab') { e.preventDefault(); this.showWorldMap(); }
                if (e.code === 'Digit1') this.switchWeapon(0);
                if (e.code === 'Digit2') this.switchWeapon(1);
                if (e.code === 'Digit3') this.switchWeapon(2);
            }
            if (this.mode === 'dialog') {
                if (e.code === 'Space' || e.code === 'KeyE') this.advanceDialog();
            }
            if (this.mode === 'battle') {
                if (e.code === 'Digit1') this.selectBattleAnswer(0);
                if (e.code === 'Digit2') this.selectBattleAnswer(1);
                if (e.code === 'Digit3') this.selectBattleAnswer(2);
                if (e.code === 'Digit4') this.selectBattleAnswer(3);
                if (e.code === 'Enter') this.submitAnswer();
            }
            if (e.code === 'Escape') {
                if (this.mode === 'menu' || this.mode === 'dialog') { this.hideAllScreens(); this.mode = 'explore'; }
            }
        });
    },

    interact() {
        const nearby = Engine3D.checkProximity();
        if (!nearby) return;
        switch (nearby.type) {
            case 'enemy': this.startBattle(nearby.data); break;
            case 'npc': this.startDialog(nearby.data); break;
            case 'chest': this.openChest(nearby.data); break;
            case 'shop': this.openShop(); break;
        }
    },

    switchWeapon(id) {
        if (!this.state) return;
        if (this.state.unlockedWeapons.includes(id)) {
            this.state.currentWeapon = id;
            this.updateWeaponSlots();
            Engine3D.updateWeaponVisual();
            const weapon = World.getWeapon(id);
            if (weapon) this.notify(weapon.icon + ' ' + weapon.name, 'info');
            Sound.play('select');
        } else {
            this.notify('هذا السلاح مقفل!', 'warning');
        }
    },

    startDialog(npc) {
        this.mode = 'dialog';
        this.dialogQueue = [...npc.dialog];
        this.dialogCallback = null;
        if (document.pointerLockElement) document.exitPointerLock();
        const box = document.getElementById('dialog-box');
        box.classList.remove('hidden');
        document.getElementById('dialog-name').textContent = npc.name;
        document.getElementById('dialog-portrait').textContent = npc.emoji || '👤';
        this.advanceDialog();
        Sound.play('dialog');
    },

    advanceDialog() {
        if (this.dialogQueue.length === 0) {
            document.getElementById('dialog-box').classList.add('hidden');
            this.mode = 'explore';
            if (this.dialogCallback) this.dialogCallback();
            return;
        }
        document.getElementById('dialog-text').textContent = this.dialogQueue.shift();
        Sound.play('click');
    },

    openChest(chest) {
        if (!this.state) return;
        if (this.state.openedChests.includes(chest.id)) return;
        this.state.openedChests.push(chest.id);
        this.state.gold += chest.gold;
        if (chest.item) this.state.inventory[chest.item] = (this.state.inventory[chest.item] || 0) + 1;
        Engine3D.removeChest(chest.id);
        this.saveState();
        this.updateHUD();
        this.notify('صندوق كنز! +' + chest.gold + ' ذهب', 'success');
        if (chest.item) {
            const itemData = World.shopItems.find(i => i.id === chest.item);
            if (itemData) this.notify('حصلت على: ' + itemData.name, 'success');
        }
        Sound.play('chest');
    },

    openShop() {
        this.mode = 'menu';
        if (document.pointerLockElement) document.exitPointerLock();
        this.showScreen('screen-shop');
        document.getElementById('shop-gold').textContent = '🪙 ' + this.state.gold;
        this.renderShop('items');
        Sound.play('shop');
    },

    renderShop(tab) {
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';
        const items = World.shopItems.filter(i => i.tab === (tab || 'items'));
        items.forEach(item => {
            const owned = this.state.inventory[item.id] || 0;
            const canBuy = this.state.gold >= item.price && owned < item.max;
            if (item.effect.type === 'weapon_upgrade' && !this.state.unlockedWeapons.includes(item.effect.weapon)) return;
            const div = document.createElement('div');
            div.className = 'shop-item' + (owned >= item.max ? ' owned' : '');
            div.innerHTML = '<div class="shop-item-icon">' + item.icon + '</div><div class="shop-item-name">' + item.name + '</div><div class="shop-item-desc">' + item.desc + '</div><div class="shop-item-price">🪙 ' + item.price + (owned > 0 ? ' (' + owned + '/' + item.max + ')' : '') + '</div>';
            if (canBuy) div.addEventListener('click', () => { this.buyItem(item); this.renderShop(tab); });
            grid.appendChild(div);
        });
    },

    buyItem(item) {
        if (this.state.gold < item.price) { this.notify('لا يوجد ذهب كافٍ!', 'error'); return; }
        const owned = this.state.inventory[item.id] || 0;
        if (owned >= item.max) { this.notify('وصلت الحد الأقصى!', 'warning'); return; }
        this.state.gold -= item.price;
        switch (item.effect.type) {
            case 'weapon_upgrade':
                this.state.weaponDamage[item.effect.weapon] += item.effect.value;
                this.state.inventory[item.id] = (this.state.inventory[item.id] || 0) + 1;
                break;
            case 'hp_upgrade':
                this.state.maxHp += item.effect.value;
                this.state.currentHp += item.effect.value;
                this.state.inventory[item.id] = (this.state.inventory[item.id] || 0) + 1;
                break;
            default:
                this.state.inventory[item.id] = (this.state.inventory[item.id] || 0) + 1;
        }
        this.saveState();
        this.updateHUD();
        document.getElementById('shop-gold').textContent = '🪙 ' + this.state.gold;
        this.notify('تم شراء ' + item.name + '!', 'success');
        Sound.play('buy');
    },

    startBattle(enemy) {
        this.mode = 'battle';
        this.battle = {
            enemy: { ...enemy },
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.hp,
            playerHp: this.state.currentHp,
            playerMaxHp: this.state.maxHp,
            combo: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            startTime: Date.now(),
            currentQuestion: null,
            shieldActive: false,
            powerActive: false,
        };
        this.selectedAnswer = null;
        if (document.pointerLockElement) document.exitPointerLock();
        this.showScreen('screen-battle');
        document.getElementById('bf-player-name').textContent = this.state.playerName;
        document.getElementById('bf-enemy-name').textContent = enemy.name;
        document.getElementById('bf-enemy-level').textContent = 'م.' + enemy.level;
        const weapon = World.getWeapon(this.state.currentWeapon);
        document.getElementById('bf-player-weapon').textContent = weapon ? weapon.icon + ' ' + weapon.name : '📐 رياضيات';
        this.updateBattleHP();
        this.nextQuestion();
        Sound.play('battleStart');
        const char = World.characters.find(c => c.id === this.state.characterId);
        Engine3D.renderBattle(char, enemy, 1, 1);
    },

    nextQuestion() {
        if (!this.battle) return;
        const weapon = World.getWeapon(this.state.currentWeapon);
        const subject = weapon ? weapon.subject : 'math';
        const region = World.getRegion(this.state.currentRegion);
        const difficulty = region ? region.difficulty : 'easy';
        const grade = this.state.grade;
        const question = Questions.generateForBattle(subject, difficulty, grade);
        this.battle.currentQuestion = question;
        this.selectedAnswer = null;
        document.getElementById('bq-text').textContent = question.question;
        document.getElementById('bq-category').textContent = question.category || subject;
        document.getElementById('bq-difficulty').textContent = difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب';
        const catEl = document.getElementById('bq-category');
        catEl.style.background = weapon ? weapon.color : '#4ecdc4';
        document.getElementById('bq-hint').style.display = 'none';
        document.getElementById('bq-explanation').style.display = 'none';
        document.getElementById('btn-submit').disabled = true;
        if (this.battle.combo >= 2) {
            document.getElementById('battle-combo').style.display = 'block';
            document.getElementById('combo-num').textContent = this.battle.combo;
        } else {
            document.getElementById('battle-combo').style.display = 'none';
        }
        const answersEl = document.getElementById('bq-answers');
        answersEl.innerHTML = '';
        question.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'bq-answer';
            btn.textContent = opt;
            btn.dataset.index = i;
            btn.addEventListener('click', () => this.selectBattleAnswer(i));
            answersEl.appendChild(btn);
        });
        this.battleTimeLeft = 30;
        document.getElementById('bq-timer').textContent = this.battleTimeLeft;
        if (this.battleTimer) clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => {
            this.battleTimeLeft--;
            document.getElementById('bq-timer').textContent = this.battleTimeLeft;
            if (this.battleTimeLeft <= 0) { clearInterval(this.battleTimer); this.handleWrongAnswer(); }
        }, 1000);
    },

    selectBattleAnswer(index) {
        if (!this.battle || !this.battle.currentQuestion) return;
        this.selectedAnswer = index;
        document.querySelectorAll('.bq-answer').forEach((btn, i) => btn.classList.toggle('selected', i === index));
        document.getElementById('btn-submit').disabled = false;
    },

    submitAnswer() {
        if (this.selectedAnswer === null || !this.battle || !this.battle.currentQuestion) return;
        clearInterval(this.battleTimer);
        const question = this.battle.currentQuestion;
        const selected = question.options[this.selectedAnswer];
        const isCorrect = selected === question.correctAnswer;
        this.battle.questionsAnswered++;
        this.state.totalQuestions++;
        document.querySelectorAll('.bq-answer').forEach((btn, i) => {
            if (question.options[i] === question.correctAnswer) btn.classList.add('correct');
            else if (i === this.selectedAnswer && !isCorrect) btn.classList.add('wrong');
            btn.style.pointerEvents = 'none';
        });
        if (isCorrect) this.handleCorrectAnswer();
        else this.handleWrongAnswer();
        if (question.explanation) {
            const expEl = document.getElementById('bq-explanation');
            expEl.textContent = question.explanation;
            expEl.style.display = 'block';
        }
    },

    handleCorrectAnswer() {
        this.battle.combo++;
        this.battle.correctAnswers++;
        this.state.totalCorrect++;
        let damage = this.state.weaponDamage[this.state.currentWeapon] || 25;
        if (this.battle.combo >= 2) damage = Math.round(damage * (1 + this.battle.combo * 0.2));
        if (this.battle.powerActive) { damage *= 2; this.battle.powerActive = false; }
        this.battle.enemyHp = Math.max(0, this.battle.enemyHp - damage);
        this.showBattleMsg('✓ صحيح! -' + damage + ' ضرر', '#06d6a0');
        Sound.play('correct');
        this.updateBattleHP();
        const char = World.characters.find(c => c.id === this.state.characterId);
        Engine3D.renderBattle(char, this.battle.enemy, this.battle.playerHp / this.battle.playerMaxHp, this.battle.enemyHp / this.battle.enemyMaxHp);
        if (this.battle.enemyHp <= 0) setTimeout(() => this.handleVictory(), 1500);
        else setTimeout(() => this.nextQuestion(), 2000);
    },

    handleWrongAnswer() {
        this.battle.combo = 0;
        let enemyDmg = this.battle.enemy.dmg;
        if (this.battle.shieldActive) {
            enemyDmg = 0;
            this.battle.shieldActive = false;
            this.showBattleMsg('🛡️ الدرع صد الهجوم!', '#ffd166');
        } else {
            this.battle.playerHp = Math.max(0, this.battle.playerHp - enemyDmg);
            this.showBattleMsg('✗ خطأ! -' + enemyDmg + ' ضرر عليك', '#ef476f');
        }
        Sound.play('wrong');
        this.updateBattleHP();
        const char = World.characters.find(c => c.id === this.state.characterId);
        Engine3D.renderBattle(char, this.battle.enemy, this.battle.playerHp / this.battle.playerMaxHp, this.battle.enemyHp / this.battle.enemyMaxHp);
        if (this.battle.playerHp <= 0) setTimeout(() => this.handleDefeat(), 1500);
        else setTimeout(() => this.nextQuestion(), 2000);
    },

    handleVictory() {
        const enemy = this.battle.enemy;
        if (!this.state.completedEnemies.includes(enemy.id)) this.state.completedEnemies.push(enemy.id);
        const goldReward = enemy.gold;
        const xpReward = enemy.xp;
        this.state.gold += goldReward;
        this.addXP(xpReward);
        this.state.currentHp = this.battle.playerHp;
        const accuracy = this.battle.correctAnswers / Math.max(1, this.battle.questionsAnswered);
        let stars = 1;
        if (accuracy >= 0.8) stars = 2;
        if (accuracy >= 0.95) stars = 3;
        this.state.stars += stars;
        Engine3D.removeEnemy(enemy.id);
        this.showScreen('screen-victory');
        document.getElementById('victory-title').textContent = enemy.isBoss ? 'انتصار عظيم!' : 'انتصار!';
        document.getElementById('victory-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        document.getElementById('victory-stats').innerHTML = '<div class="victory-stat"><div class="victory-stat-label">الإجابات الصحيحة</div><div class="victory-stat-value">' + this.battle.correctAnswers + '/' + this.battle.questionsAnswered + '</div></div><div class="victory-stat"><div class="victory-stat-label">أعلى كومبو</div><div class="victory-stat-value">' + this.battle.combo + 'x</div></div><div class="victory-stat"><div class="victory-stat-label">الذهب المكتسب</div><div class="victory-stat-value">🪙 ' + goldReward + '</div></div><div class="victory-stat"><div class="victory-stat-label">الخبرة المكتسبة</div><div class="victory-stat-value">⭐ ' + xpReward + ' XP</div></div>';
        document.getElementById('victory-rewards').innerHTML = '<p>+' + goldReward + ' ذهب | +' + xpReward + ' خبرة | +' + stars + ' نجمة</p>';
        if (enemy.isBoss && enemy.unlocks) {
            if (!this.state.bossesDefeated.includes(enemy.id)) this.state.bossesDefeated.push(enemy.id);
            if (enemy.unlocks === 'victory') {
                const unlockEl = document.getElementById('victory-unlock');
                unlockEl.style.display = 'block';
                unlockEl.innerHTML = '<h3>🎉 تهانينا! أتممت اللعبة!</h3><p>لقد هزمت سيد الجهل وحررت مملكة العلوم!</p>';
            } else {
                if (!this.state.unlockedRegions.includes(enemy.unlocks)) {
                    this.state.unlockedRegions.push(enemy.unlocks);
                    const nextRegion = World.getRegion(enemy.unlocks);
                    if (nextRegion) {
                        const unlockEl = document.getElementById('victory-unlock');
                        unlockEl.style.display = 'block';
                        unlockEl.innerHTML = '<h3>🗺️ تم فتح منطقة جديدة!</h3><p>' + nextRegion.name + ': ' + nextRegion.desc + '</p>';
                        setTimeout(() => this.showRegionUnlock(nextRegion.name), 500);
                    }
                }
            }
        }
        this.saveState();
        Sound.play('victory');
        this.battle = null;
    },

    handleDefeat() {
        this.state.currentHp = Math.max(30, Math.round(this.state.maxHp * 0.3));
        this.saveState();
        this.showScreen('screen-defeat');
        document.getElementById('defeat-review').innerHTML = '<p>راجع الأسئلة وحاول مرة أخرى</p>';
        Sound.play('defeat');
    },

    useHint() {
        if (!this.battle || !this.battle.currentQuestion) return;
        const hintCount = this.state.inventory['hint_scroll'] || 0;
        if (hintCount <= 0) { this.notify('لا توجد لفافات تلميح!', 'warning'); return; }
        this.state.inventory['hint_scroll']--;
        this.saveState();
        const hint = this.battle.currentQuestion.hint;
        if (hint) {
            document.getElementById('bq-hint').textContent = '💡 ' + hint;
            document.getElementById('bq-hint').style.display = 'block';
        }
        Sound.play('hint');
    },

    addXP(amount) {
        this.state.xp += amount;
        while (this.state.playerLevel < this.xpTable.length - 1 && this.state.xp >= this.xpTable[this.state.playerLevel]) {
            this.state.playerLevel++;
            this.showLevelUp();
        }
    },

    showLevelUp() {
        const el = document.getElementById('level-up');
        el.classList.remove('hidden');
        document.getElementById('level-up-text').textContent = 'المستوى ' + this.state.playerLevel;
        this.state.maxHp += 10;
        this.state.currentHp = this.state.maxHp;
        document.getElementById('level-up-unlock').textContent = '+10 صحة قصوى';
        Sound.play('levelUp');
        setTimeout(() => el.classList.add('hidden'), 3000);
    },

    showRegionUnlock(name) {
        const el = document.getElementById('region-unlock');
        el.classList.remove('hidden');
        document.getElementById('region-unlock-name').textContent = name;
        setTimeout(() => el.classList.add('hidden'), 4000);
    },

    showWorldMap() {
        this.mode = 'menu';
        if (document.pointerLockElement) document.exitPointerLock();
        this.showScreen('screen-worldmap');
        this.renderWorldMap();
    },

    renderWorldMap() {
        const canvas = document.getElementById('worldmap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i < World.regions.length - 1; i++) {
            const r1 = World.regions[i], r2 = World.regions[i + 1];
            ctx.beginPath(); ctx.moveTo(r1.mapPos.x, r1.mapPos.y); ctx.lineTo(r2.mapPos.x, r2.mapPos.y); ctx.stroke();
        }
        ctx.setLineDash([]);
        const icons = { village: '🏘️', forest: '🌲', city: '🏙️', cave: '🕳️', castle: '🏰' };
        World.regions.forEach(region => {
            const unlocked = this.state && this.state.unlockedRegions.includes(region.id);
            const isCurrent = this.state && this.state.currentRegion === region.id;
            const x = region.mapPos.x, y = region.mapPos.y;
            if (isCurrent) { ctx.fillStyle = region.color + '44'; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill(); }
            ctx.fillStyle = unlocked ? region.color : '#333333';
            ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = isCurrent ? '#ffffff' : unlocked ? region.color : '#555555';
            ctx.lineWidth = isCurrent ? 3 : 2;
            ctx.stroke();
            ctx.fillStyle = unlocked ? '#ffffff' : '#666666';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[region.type] || '📍', x, y);
            ctx.font = 'bold 12px Arial';
            ctx.fillText(region.name, x, y + 38);
            if (!unlocked) { ctx.fillStyle = '#ff6666'; ctx.font = '14px Arial'; ctx.fillText('🔒', x, y - 30); }
        });
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
            World.regions.forEach(region => {
                const dx = mx - region.mapPos.x, dy = my - region.mapPos.y;
                if (Math.sqrt(dx * dx + dy * dy) < 30) {
                    this._selectedMapRegion = region.id;
                    document.getElementById('map-region-name').textContent = region.name;
                    document.getElementById('map-region-desc').textContent = region.desc;
                    const unlocked = this.state && this.state.unlockedRegions.includes(region.id);
                    document.getElementById('map-region-stats').innerHTML = '<p>الصعوبة: ' + (region.difficulty === 'easy' ? 'سهل' : region.difficulty === 'medium' ? 'متوسط' : 'صعب') + '</p><p>المواد: ' + region.subjects.map(s => s === 'math' ? '📐 رياضيات' : s === 'physics' ? '⚛️ فيزياء' : '🧪 كيمياء').join(' | ') + '</p><p>' + (unlocked ? '✅ مفتوحة' : '🔒 مقفلة') + '</p>';
                    const travelBtn = document.getElementById('btn-travel');
                    travelBtn.disabled = !unlocked;
                    travelBtn.textContent = unlocked ? 'سافر إلى المنطقة' : 'مقفلة';
                }
            });
        };
    },

    renderCharacterSelect() {
        const grid = document.getElementById('char-grid');
        grid.innerHTML = '';
        World.characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.dataset.charId = char.id;
            card.innerHTML = '<div class="char-avatar">' + char.emoji + '</div><div class="char-name">' + char.name + '</div><div class="char-desc">' + char.desc + '</div><div class="char-stats"><div class="char-stat"><span class="char-stat-value">' + char.hp + '</span><span class="char-stat-label">صحة</span></div><div class="char-stat"><span class="char-stat-value">' + char.dmg + '</span><span class="char-stat-label">ضرر</span></div><div class="char-stat"><span class="char-stat-value">' + char.def + '</span><span class="char-stat-label">دفاع</span></div></div>';
            card.addEventListener('click', () => {
                document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('btn-start').disabled = false;
                Sound.play('select');
            });
            grid.appendChild(card);
        });
    },

    updateHUD() {
        if (!this.state) return;
        document.getElementById('hud-name').textContent = this.state.playerName;
        document.getElementById('hud-level').textContent = this.state.playerLevel;
        document.getElementById('hud-gold').textContent = this.state.gold;
        document.getElementById('hud-keys').textContent = this.state.keys;
        document.getElementById('hud-stars').textContent = this.state.stars;
        const hpPct = (this.state.currentHp / this.state.maxHp) * 100;
        document.getElementById('hud-hp').style.width = hpPct + '%';
        document.getElementById('hud-hp-text').textContent = this.state.currentHp + '/' + this.state.maxHp;
        const currentLevelXP = this.xpTable[this.state.playerLevel - 1] || 0;
        const nextLevelXP = this.xpTable[this.state.playerLevel] || this.xpTable[this.xpTable.length - 1];
        const xpPct = ((this.state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        document.getElementById('hud-xp').style.width = Math.min(100, Math.max(0, xpPct)) + '%';
        document.getElementById('hud-xp-text').textContent = this.state.xp + '/' + nextLevelXP + ' XP';
        const char = World.characters.find(c => c.id === this.state.characterId);
        if (char) document.getElementById('hud-avatar').textContent = char.emoji;
        this.updateWeaponSlots();
    },

    updateWeaponSlots() {
        if (!this.state) return;
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            const slotNum = parseInt(slot.dataset.slot);
            const unlocked = this.state.unlockedWeapons.includes(slotNum);
            const active = this.state.currentWeapon === slotNum;
            slot.classList.toggle('active', active);
            slot.classList.toggle('locked', !unlocked);
            const ammoEl = slot.querySelector('.weapon-ammo');
            if (ammoEl) ammoEl.textContent = unlocked ? '∞' : '🔒';
        });
    },

    updateBattleHP() {
        if (!this.battle) return;
        const playerPct = (this.battle.playerHp / this.battle.playerMaxHp) * 100;
        const enemyPct = (this.battle.enemyHp / this.battle.enemyMaxHp) * 100;
        document.getElementById('bf-player-hp').style.width = playerPct + '%';
        document.getElementById('bf-player-hp-text').textContent = this.battle.playerHp + '/' + this.battle.playerMaxHp;
        document.getElementById('bf-enemy-hp').style.width = enemyPct + '%';
        document.getElementById('bf-enemy-hp-text').textContent = this.battle.enemyHp + '/' + this.battle.enemyMaxHp;
    },

    showBattleMsg(text, color) {
        const el = document.getElementById('battle-msg');
        el.textContent = text;
        el.style.color = color || '#ffffff';
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 1500);
    },

    showScreen(id) {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    },

    hideAllScreens() {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
    },

    notify(text, type) {
        const container = document.getElementById('notif-container');
        const notif = document.createElement('div');
        notif.className = 'notif ' + (type || 'info');
        notif.textContent = text;
        container.appendChild(notif);
        setTimeout(() => notif.remove(), 3500);
    },

    loop(time) {
        requestAnimationFrame(t => this.loop(t));
        if (this.mode === 'explore') {
            Engine3D.update();
            Engine3D.renderMinimap();
            const nearby = Engine3D.checkProximity();
            const hint = document.querySelector('.hud-location');
            if (nearby && nearby.type === 'enemy' && hint) hint.textContent = '⚔️ ' + nearby.data.name + ' - اضغط E للقتال';
            else if (nearby && nearby.type === 'npc' && hint) hint.textContent = '💬 ' + nearby.data.name + ' - اضغط E للحديث';
            else if (nearby && nearby.type === 'chest' && hint) hint.textContent = '📦 صندوق كنز - اضغط E لفتحه';
            else if (nearby && nearby.type === 'shop' && hint) hint.textContent = '🏪 المتجر - اضغط E للدخول';
            else {
                const region = World.getRegion(this.state ? this.state.currentRegion : 'village');
                if (hint && region) hint.textContent = region.name;
            }
        }
        if (this.mode === 'title') Engine3D.renderTitleBackground();
    }
};
