/* ============================================
   GAME ENGINE - State, Battle, Progression
   ============================================ */

const Game = {

    // ---- Game State (persisted to localStorage) ----
    state: null,
    defaultState: {
        playerName: 'Warrior',
        characterId: 'knight',
        playerLevel: 1,
        xp: 0,
        gold: 100,
        keys: 0,
        completedLevels: [],
        levelStars: {},
        inventory: {},
        achievements: [],
        secretsFound: [],
        totalCorrect: 0,
        totalQuestions: 0,
        totalPurchases: 0,
        bossesDefeated: [],
        speedAnswers: 0 // answers under 5 seconds
    },

    // ---- Battle State (temporary) ----
    battle: null,
    currentLevel: null,
    currentWorld: null,
    selectedCharacterId: null,
    selectedAnswer: null,

    // ---- Initialize ----
    init() {
        this.loadState();
    },

    // ---- State Management ----
    loadState() {
        const saved = localStorage.getItem('mathWarriorsState');
        if (saved) {
            try {
                this.state = { ...this.defaultState, ...JSON.parse(saved) };
            } catch {
                this.state = { ...this.defaultState };
            }
        } else {
            this.state = { ...this.defaultState };
        }
    },

    saveState() {
        localStorage.setItem('mathWarriorsState', JSON.stringify(this.state));
    },

    hasSaveData() {
        return localStorage.getItem('mathWarriorsState') !== null;
    },

    resetState() {
        localStorage.removeItem('mathWarriorsState');
        this.state = { ...this.defaultState };
    },

    // ---- Start New Game ----
    startNewGame(playerName, characterId) {
        this.resetState();
        this.state.playerName = playerName || 'Warrior';
        this.state.characterId = characterId;
        this.saveState();
    },

    // ---- Get Level/World Data ----
    getLevelData(levelId) {
        if (levelId === 'secret') return GameData.secretLevel;
        for (const world of GameData.worlds) {
            const level = world.levels.find(l => l.id === levelId);
            if (level) return level;
        }
        return null;
    },

    getWorldForLevel(levelId) {
        if (levelId === 'secret') return null;
        for (const world of GameData.worlds) {
            if (world.levels.find(l => l.id === levelId)) return world;
        }
        return null;
    },

    getNextLevelId(currentLevelId) {
        if (currentLevelId === 'secret') return null;
        for (const world of GameData.worlds) {
            for (let i = 0; i < world.levels.length; i++) {
                if (world.levels[i].id === currentLevelId) {
                    if (i + 1 < world.levels.length) return world.levels[i + 1].id;
                    // Check next world
                    const wi = GameData.worlds.indexOf(world);
                    if (wi + 1 < GameData.worlds.length) return GameData.worlds[wi + 1].levels[0].id;
                    return null;
                }
            }
        }
        return null;
    },

    // ---- Character Stats ----
    getPlayerStats() {
        const charData = GameData.characters.find(c => c.id === this.state.characterId);
        const level = this.state.playerLevel;
        const cfg = GameData.xpConfig;
        return {
            hp: charData.baseHp + (level - 1) * cfg.hpPerLevel,
            damage: charData.baseDamage + (level - 1) * cfg.damagePerLevel,
            defense: charData.defense + Math.floor((level - 1) / 2),
            special: charData.special,
            specialDesc: charData.specialDesc
        };
    },

    // ---- START BATTLE ----
    startBattle(levelId) {
        const level = this.getLevelData(levelId);
        if (!level) return;

        const world = this.getWorldForLevel(levelId);
        const stats = this.getPlayerStats();

        this.currentLevel = level;
        this.currentWorld = world;

        this.battle = {
            levelId,
            playerHp: stats.hp,
            playerMaxHp: stats.hp,
            playerDamage: stats.damage,
            playerDefense: stats.defense,
            enemyHp: level.enemy.hp,
            enemyMaxHp: level.enemy.hp,
            enemyDamage: level.enemy.damage,
            enemyDefense: level.enemy.defense,
            turn: 1,
            combo: 0,
            bestCombo: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            wrongAnswers: [],
            specialCharge: 0,
            specialMaxCharge: 5,
            specialReady: false,
            shieldActive: false,
            powerMultiplier: 1,
            bonusProblems: 0,
            keysEarned: 0,
            questionStartTime: 0,
            questionsToWin: level.questionsToWin || 8,
            currentProblem: null,
            isActive: true,
            secretDiscovered: false,
            speedAnswersThisBattle: 0
        };

        UI.switchScreen('screen-battle');
        setTimeout(() => {
            UI.renderBattleStart(level, world);
            this.nextQuestion();
        }, 300);
    },

    // ---- NEXT QUESTION ----
    nextQuestion() {
        if (!this.battle || !this.battle.isActive) return;

        // Check if enemy is defeated
        if (this.battle.enemyHp <= 0) {
            this.battleVictory();
            return;
        }

        // Check if player is defeated
        if (this.battle.playerHp <= 0) {
            this.battleDefeat();
            return;
        }

        // Chance for bonus problem (15%)
        const isBonus = Math.random() < 0.15;
        let problem;
        if (isBonus) {
            problem = MathEngine.generateBonusProblem(this.currentLevel.mathTopics);
            UI.notify('\u2728 Bonus Problem! Solve for a key!', 'secret', 2000);
        } else {
            problem = MathEngine.generateProblem(
                this.currentLevel.mathTopics,
                this.currentLevel.difficulty
            );
        }

        this.battle.currentProblem = problem;
        this.battle.totalQuestions++;

        UI.renderQuestion(problem);
        UI.updateTurn(this.battle.turn);

        // Start timer
        const timeLimit = this.currentLevel.difficulty === 'hard' ? 25 :
                          this.currentLevel.difficulty === 'medium' ? 30 : 35;
        UI.startTimer(timeLimit, null, () => {
            // Time's up - treat as wrong
            this.processAnswer(false);
        });
    },

    // ---- SUBMIT ANSWER ----
    submitAnswer() {
        if (!this.battle || !this.battle.isActive || !this.selectedAnswer) return;

        UI.stopTimer();
        const elapsed = UI.getElapsedTime();
        const problem = this.battle.currentProblem;
        const correct = String(this.selectedAnswer).trim() === String(problem.correctAnswer).trim();

        this.processAnswer(correct, elapsed);
    },

    // ---- PROCESS ANSWER ----
    processAnswer(correct, elapsed = 999) {
        const battle = this.battle;
        const problem = battle.currentProblem;
        const level = this.currentLevel;

        if (correct) {
            // ---- CORRECT ANSWER ----
            battle.correctAnswers++;
            battle.combo++;
            if (battle.combo > battle.bestCombo) battle.bestCombo = battle.combo;
            battle.specialCharge = Math.min(battle.specialMaxCharge, battle.specialCharge + 1);

            // Calculate damage
            let damage = battle.playerDamage;
            // Combo bonus
            damage += Math.floor(battle.combo * 3);
            // Speed bonus (under 5 seconds)
            const speedBonus = elapsed < 5;
            if (speedBonus) {
                damage = Math.floor(damage * 1.3);
                battle.speedAnswersThisBattle++;
            }
            // Power multiplier from items
            damage = Math.floor(damage * battle.powerMultiplier);
            battle.powerMultiplier = 1;
            // Enemy defense reduction
            damage = Math.max(5, damage - level.enemy.defense);
            // Critical hit (10% chance, more with high combo)
            const critChance = 0.1 + battle.combo * 0.03;
            const isCritical = Math.random() < critChance;
            if (isCritical) damage = Math.floor(damage * 1.8);

            // Apply damage
            battle.enemyHp -= damage;

            // UI feedback
            UI.showAnswerResult(true, problem, damage);
            UI.updateCombo(battle.combo);

            setTimeout(() => {
                UI.playAttackAnimation(true);
                setTimeout(() => {
                    UI.showDamageNumber(damage, false, isCritical);
                    UI.updateEnemyHealth();
                    UI.updateSpecialBar();

                    if (speedBonus) {
                        UI.showBattleMessage('Speed Bonus! +30% damage', 1200);
                    } else if (isCritical) {
                        UI.showBattleMessage('CRITICAL HIT!', 1200);
                    }

                    // Check bonus reward
                    if (problem.isBonus) {
                        battle.keysEarned++;
                        this.state.keys++;
                        UI.notify('\u{1F511} You earned a key!', 'secret');
                    }

                    // Proceed to next turn
                    setTimeout(() => {
                        battle.turn++;
                        this.nextQuestion();
                    }, 1200);
                }, 350);
            }, 500);

        } else {
            // ---- WRONG ANSWER ----
            battle.combo = 0;
            battle.wrongAnswers.push({
                question: problem.question,
                correctAnswer: problem.correctAnswer,
                playerAnswer: this.selectedAnswer || 'No answer'
            });

            // Enemy attacks
            let enemyDamage = battle.enemyDamage;
            if (battle.shieldActive) {
                enemyDamage = 0;
                battle.shieldActive = false;
                UI.showBattleMessage('Shield absorbed the attack!', 1500);
            } else {
                enemyDamage = Math.max(3, enemyDamage - battle.playerDefense);
            }
            battle.playerHp -= enemyDamage;

            // UI feedback
            UI.showAnswerResult(false, problem, enemyDamage);
            UI.updateCombo(0);

            setTimeout(() => {
                if (enemyDamage > 0) {
                    UI.playAttackAnimation(false);
                    setTimeout(() => {
                        UI.showDamageNumber(enemyDamage, true);
                        UI.updatePlayerHealth();
                    }, 350);
                }

                // Show explanation
                setTimeout(() => {
                    UI.showBattleMessage(`Answer: ${problem.correctAnswer}`, 2500);
                }, 800);

                // Proceed to next turn
                setTimeout(() => {
                    battle.turn++;
                    this.nextQuestion();
                }, 2800);
            }, 500);
        }
    },

    // ---- USE SPECIAL ----
    useSpecial() {
        if (!this.battle || this.battle.specialCharge < this.battle.specialMaxCharge) return;
        const charData = GameData.characters.find(c => c.id === this.state.characterId);
        this.battle.specialCharge = 0;

        switch (charData.id) {
            case 'knight': // Shield Bash - block next attack
                this.battle.shieldActive = true;
                UI.showBattleMessage('Shield activated! Next attack blocked!', 2000);
                break;
            case 'mage': // Arcane Blast - double damage next hit
                this.battle.powerMultiplier = 2;
                UI.showBattleMessage('Arcane power surges! Next hit = 2x damage!', 2000);
                break;
            case 'ranger': // Quick Shot - auto correct
                this.battle.correctAnswers++;
                const quickDmg = this.battle.playerDamage;
                this.battle.enemyHp -= quickDmg;
                UI.playAttackAnimation(true);
                setTimeout(() => {
                    UI.showDamageNumber(quickDmg, false);
                    UI.updateEnemyHealth();
                }, 350);
                UI.showBattleMessage('Quick Shot! Free hit!', 1500);
                break;
            case 'paladin': // Holy Light - heal 30%
                const healAmt = Math.floor(this.battle.playerMaxHp * 0.3);
                this.battle.playerHp = Math.min(this.battle.playerMaxHp, this.battle.playerHp + healAmt);
                UI.showHealNumber(healAmt);
                UI.updatePlayerHealth();
                UI.showBattleMessage(`Healed ${healAmt} HP!`, 1500);
                break;
            case 'ninja': // Shadow Strike - guaranteed crit next hit
                this.battle.powerMultiplier = 2.5;
                UI.showBattleMessage('Shadow Strike ready! Massive damage next hit!', 2000);
                break;
            case 'dragon': // Dragon Fire - burn damage
                const burnDmg = Math.floor(this.battle.playerDamage * 0.5) * 3;
                this.battle.enemyHp -= burnDmg;
                UI.showDamageNumber(burnDmg, false, true);
                UI.updateEnemyHealth();
                UI.showBattleMessage(`Dragon Fire! ${burnDmg} burn damage!`, 2000);
                break;
        }

        UI.updateSpecialBar();
    },

    // ---- BATTLE VICTORY ----
    battleVictory() {
        this.battle.isActive = false;
        UI.stopTimer();
        UI.playDefeatAnimation(false);

        setTimeout(() => {
            const battle = this.battle;
            const level = this.currentLevel;

            // Calculate stars
            const accuracy = battle.correctAnswers / Math.max(1, battle.totalQuestions);
            let stars = 1;
            if (accuracy >= 0.7) stars = 2;
            if (accuracy >= 0.9) stars = 3;

            // Calculate rewards
            const cfg = GameData.goldConfig;
            let goldEarned = cfg.baseGoldPerWin + battle.correctAnswers * cfg.goldPerCorrect;
            if (level.isBoss) goldEarned *= cfg.bossGoldMultiplier;
            if (accuracy === 1) goldEarned += cfg.perfectBonusGold;

            const xpCfg = GameData.xpConfig;
            let xpEarned = battle.correctAnswers * xpCfg.correctAnswerXp;
            xpEarned += battle.bestCombo * xpCfg.comboXpBonus;
            if (level.isBoss) xpEarned *= xpCfg.bossXpMultiplier;

            // Apply rewards
            this.state.gold += goldEarned;
            this.state.xp += xpEarned;
            this.state.totalCorrect += battle.correctAnswers;
            this.state.totalQuestions += battle.totalQuestions;
            this.state.speedAnswers += battle.speedAnswersThisBattle;

            // Mark level complete
            const levelId = battle.levelId;
            if (!this.state.completedLevels.includes(levelId)) {
                this.state.completedLevels.push(levelId);
            }
            if (!this.state.levelStars[levelId] || this.state.levelStars[levelId] < stars) {
                this.state.levelStars[levelId] = stars;
            }

            // Boss tracking
            if (level.isBoss && !this.state.bossesDefeated.includes(levelId)) {
                this.state.bossesDefeated.push(levelId);
            }

            // Check for secrets
            let secretFound = null;
            if (level.secretClue && !this.state.secretsFound.includes(levelId)) {
                // Secret is found with some probability or on 3 stars
                if (stars === 3 || Math.random() < 0.5) {
                    this.state.secretsFound.push(levelId);
                    secretFound = level.secretClue;
                }
            }

            // Check level up
            const oldLevel = this.state.playerLevel;
            this.checkLevelUp();
            const leveledUp = this.state.playerLevel > oldLevel;

            // Check achievements
            this.checkAchievements();

            // Build rewards list
            const rewards = [`+${goldEarned} Gold`, `+${xpEarned} XP`];
            if (battle.keysEarned > 0) rewards.push(`+${battle.keysEarned} Key(s)`);
            if (accuracy === 1) rewards.push('Perfect Battle Bonus!');

            const results = {
                stars,
                correctAnswers: battle.correctAnswers,
                totalQuestions: battle.totalQuestions,
                bestCombo: battle.bestCombo,
                goldEarned,
                xpEarned,
                rewards,
                secretFound,
                leveledUp,
                newLevel: this.state.playerLevel,
                isBoss: level.isBoss
            };

            this.saveState();
            UI.renderVictory(results);
            UI.switchScreen('screen-victory');
        }, 1500);
    },

    // ---- BATTLE DEFEAT ----
    battleDefeat() {
        this.battle.isActive = false;
        UI.stopTimer();
        UI.playDefeatAnimation(true);

        setTimeout(() => {
            // Give some consolation XP
            const xp = Math.floor(this.battle.correctAnswers * 5);
            this.state.xp += xp;
            this.state.totalCorrect += this.battle.correctAnswers;
            this.state.totalQuestions += this.battle.totalQuestions;
            this.saveState();

            UI.renderDefeat({
                wrongAnswers: this.battle.wrongAnswers
            });
            UI.switchScreen('screen-defeat');
        }, 1500);
    },

    // ---- LEVEL UP CHECK ----
    checkLevelUp() {
        const xpTable = GameData.xpConfig.xpPerLevel;
        let level = this.state.playerLevel;
        while (level < xpTable.length - 1 && this.state.xp >= xpTable[level]) {
            level++;
        }
        this.state.playerLevel = level;
    },

    // ---- ACHIEVEMENTS ----
    checkAchievements() {
        const s = this.state;
        const unlock = (id) => {
            if (!s.achievements.includes(id)) {
                s.achievements.push(id);
                const ach = GameData.achievements.find(a => a.id === id);
                if (ach) {
                    setTimeout(() => UI.notify(`\u{1F3C6} Achievement: ${ach.name}!`, 'secret', 4000), 500);
                }
            }
        };

        // First blood
        if (s.completedLevels.length >= 1) unlock('first_blood');

        // Perfect round
        if (this.battle && this.battle.correctAnswers === this.battle.totalQuestions &&
            this.battle.playerHp === this.battle.playerMaxHp) {
            unlock('perfect_round');
        }

        // Combo master
        if (this.battle && this.battle.bestCombo >= 5) unlock('combo_master');

        // Speed demon
        if (s.speedAnswers >= 5) unlock('speed_demon');

        // World completions
        const worldAchievements = ['world1_complete', 'world2_complete', 'world3_complete', 'world4_complete', 'world5_complete'];
        GameData.worlds.forEach((world, i) => {
            if (world.levels.every(l => s.completedLevels.includes(l.id))) {
                unlock(worldAchievements[i]);
            }
        });

        // Secrets
        if (s.secretsFound.length >= 1) unlock('secret_finder');
        if (s.secretsFound.length >= 5) unlock('all_secrets');

        // Shopping
        if (s.totalPurchases >= 10) unlock('shopaholic');

        // Boss slayer
        if (s.bossesDefeated.length >= 1) unlock('boss_slayer');
        const allBosses = GameData.worlds.flatMap(w => w.levels.filter(l => l.isBoss).map(l => l.id));
        if (allBosses.every(id => s.bossesDefeated.includes(id))) unlock('all_bosses');

        // Math genius
        if (s.totalCorrect >= 100) unlock('math_genius');

        // Stars
        if (Object.values(s.levelStars).some(st => st >= 3)) unlock('three_stars');
        const allLevelIds = GameData.worlds.flatMap(w => w.levels.map(l => l.id));
        if (allLevelIds.every(id => s.levelStars[id] >= 3)) unlock('all_three_stars');

        // Level 10
        if (s.playerLevel >= 10) unlock('level_10');

        // Secret level
        if (s.completedLevels.includes('secret')) unlock('secret_level');

        // Game complete
        if (allLevelIds.every(id => s.completedLevels.includes(id))) unlock('game_complete');

        // Check character unlocks
        this.checkCharacterUnlocks();
    },

    checkCharacterUnlocks() {
        const s = this.state;
        // Ninja: find all 5 world secrets
        if (s.secretsFound.length >= 5) {
            const ninja = GameData.characters.find(c => c.id === 'ninja');
            if (ninja && !ninja.unlocked) {
                ninja.unlocked = true;
                UI.notify('\u{1F977} Secret Character Unlocked: Algebra Ninja!', 'secret', 5000);
            }
        }
        // Dragon: all levels with 3 stars
        const allLevelIds = GameData.worlds.flatMap(w => w.levels.map(l => l.id));
        if (allLevelIds.every(id => s.levelStars[id] >= 3)) {
            const dragon = GameData.characters.find(c => c.id === 'dragon');
            if (dragon && !dragon.unlocked) {
                dragon.unlocked = true;
                UI.notify('\u{1F432} Secret Character Unlocked: Prime Dragon!', 'secret', 5000);
            }
        }
    },

    // ---- SHOP ----
    buyItem(itemId) {
        const item = GameData.shopItems.find(i => i.id === itemId);
        if (!item) return;
        const owned = this.state.inventory[itemId] || 0;
        if (this.state.gold < item.price || owned >= item.maxStack) return;

        this.state.gold -= item.price;
        this.state.inventory[itemId] = owned + 1;
        this.state.totalPurchases++;
        this.saveState();
        this.checkAchievements();
        UI.notify(`Purchased ${item.name}!`, 'success');
    },

    // ---- USE ITEM IN BATTLE ----
    useItem(itemId) {
        if (!this.battle || !this.battle.isActive) return;
        const item = GameData.shopItems.find(i => i.id === itemId);
        if (!item || (this.state.inventory[itemId] || 0) <= 0) return;

        this.state.inventory[itemId]--;
        document.getElementById('battle-result').style.display = 'none';

        switch (item.effect.type) {
            case 'heal':
                this.battle.playerHp = Math.min(
                    this.battle.playerMaxHp,
                    this.battle.playerHp + item.effect.value
                );
                UI.showHealNumber(item.effect.value);
                UI.updatePlayerHealth();
                UI.showBattleMessage(`Healed ${item.effect.value} HP!`, 1500);
                break;
            case 'hint':
                if (this.battle.currentProblem) {
                    document.getElementById('question-hint').textContent = this.battle.currentProblem.hint;
                    document.getElementById('question-hint').style.display = 'block';
                }
                break;
            case 'time':
                // Add time to timer - handled by showing message
                UI.showBattleMessage(`+${item.effect.value} seconds!`, 1500);
                break;
            case 'shield':
                this.battle.shieldActive = true;
                UI.showBattleMessage('Shield activated!', 1500);
                break;
            case 'power':
                this.battle.powerMultiplier = item.effect.value;
                UI.showBattleMessage('Power boosted! Next hit x2!', 1500);
                break;
            case 'eliminate':
                this.eliminateWrongOption();
                break;
        }
        this.saveState();
    },

    eliminateWrongOption() {
        const options = document.querySelectorAll('.answer-option:not(.selected)');
        const problem = this.battle.currentProblem;
        for (const opt of options) {
            if (String(opt.textContent) !== String(problem.correctAnswer)) {
                opt.style.opacity = '0.2';
                opt.style.pointerEvents = 'none';
                UI.showBattleMessage('Wrong answer eliminated!', 1500);
                return;
            }
        }
    },

    // ---- USE HINT ----
    useHint() {
        if (!this.battle || !this.battle.currentProblem) return;
        if ((this.state.inventory.hint_scroll || 0) <= 0) return;
        this.state.inventory.hint_scroll--;
        document.getElementById('question-hint').textContent = this.battle.currentProblem.hint;
        document.getElementById('question-hint').style.display = 'block';
        this.saveState();
        UI.notify('Hint revealed!', 'info');
    }
};
