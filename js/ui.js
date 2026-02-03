/* ============================================
   UI MANAGER - Rendering, Animations, Effects
   ============================================ */

const UI = {

    // Screen transitions
    switchScreen(screenId) {
        const current = document.querySelector('.screen.active');
        const next = document.getElementById(screenId);
        if (!next || current === next) return;

        if (current) {
            current.classList.add('transitioning-out');
            current.classList.remove('active');
            setTimeout(() => current.classList.remove('transitioning-out'), 500);
        }
        setTimeout(() => {
            next.classList.add('active');
        }, 100);
    },

    // ---- Notifications ----
    notify(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        container.appendChild(notif);

        setTimeout(() => {
            notif.classList.add('fade-out');
            setTimeout(() => notif.remove(), 300);
        }, duration);
    },

    // ---- Character Selection Screen ----
    renderCharacterSelect() {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';
        GameData.characters.forEach(char => {
            const card = document.createElement('div');
            card.className = `character-card ${char.unlocked ? '' : 'locked'}`;
            card.dataset.characterId = char.id;
            card.innerHTML = `
                <span class="character-avatar">${char.avatar}</span>
                <h4>${char.name}</h4>
                <p>${char.unlocked ? char.description : char.unlockCondition}</p>
                <div class="character-stats">
                    <span>HP: ${char.baseHp}</span>
                    <span>ATK: ${char.baseDamage}</span>
                    <span>DEF: ${char.defense}</span>
                </div>
            `;
            if (char.unlocked) {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    Game.selectedCharacterId = char.id;
                    document.getElementById('btn-start-adventure').disabled = false;
                });
            }
            grid.appendChild(card);
        });
    },

    // ---- World Map ----
    renderWorldMap() {
        const state = Game.state;
        document.getElementById('map-player-name').textContent = state.playerName;
        document.getElementById('map-player-level').textContent = `Lv. ${state.playerLevel}`;
        document.getElementById('map-gold').textContent = state.gold;
        document.getElementById('map-keys').textContent = state.keys;
        document.getElementById('map-xp').textContent = state.xp;

        const charData = GameData.characters.find(c => c.id === state.characterId);
        if (charData) {
            document.getElementById('map-player-avatar').textContent = charData.avatar;
        }

        const worldsList = document.getElementById('worlds-list');
        worldsList.innerHTML = '';

        GameData.worlds.forEach((world, wi) => {
            const worldUnlocked = wi === 0 || this.isWorldComplete(wi - 1);
            const worldComplete = this.isWorldComplete(wi);
            const isCurrent = worldUnlocked && !worldComplete;

            const worldCard = document.createElement('div');
            worldCard.className = `world-card ${worldUnlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''}`;

            const completedCount = world.levels.filter(l => state.completedLevels.includes(l.id)).length;

            worldCard.innerHTML = `
                <div class="world-header">
                    <div class="world-icon">${world.icon}</div>
                    <div class="world-info">
                        <h3>${world.name}</h3>
                        <p>${world.description}</p>
                        <div class="world-progress">${worldUnlocked ? `${completedCount}/${world.levels.length} completed` : 'Locked'}</div>
                    </div>
                </div>
                <div class="levels-grid" id="levels-${world.id}"></div>
            `;

            worldsList.appendChild(worldCard);

            if (worldUnlocked) {
                const levelsGrid = document.getElementById(`levels-${world.id}`);
                world.levels.forEach((level, li) => {
                    const levelUnlocked = li === 0 || state.completedLevels.includes(world.levels[li - 1].id);
                    const levelComplete = state.completedLevels.includes(level.id);
                    const stars = state.levelStars[level.id] || 0;

                    const levelCard = document.createElement('div');
                    levelCard.className = `level-card ${levelUnlocked ? '' : 'locked'} ${levelComplete ? 'completed' : ''} ${level.isBoss ? 'boss' : ''}`;
                    levelCard.innerHTML = `
                        <div class="level-number">${level.isBoss ? 'BOSS' : `Level ${level.id}`}</div>
                        <h4>${level.name}</h4>
                        <div class="level-enemy">${level.enemy.avatar} ${level.enemy.name}</div>
                        <div class="level-stars">
                            ${[1,2,3].map(s => `<span class="${s <= stars ? 'star-filled' : 'star-empty'}">\u2605</span>`).join('')}
                        </div>
                        ${level.isBoss ? '<span class="level-badge">BOSS</span>' : ''}
                    `;

                    if (levelUnlocked) {
                        levelCard.addEventListener('click', () => Game.startBattle(level.id));
                    }

                    levelsGrid.appendChild(levelCard);
                });
            }
        });

        // Secret level
        if (state.keys >= GameData.secretLevel.unlockKeys && !state.completedLevels.includes('secret')) {
            const secretCard = document.createElement('div');
            secretCard.className = 'world-card current';
            secretCard.innerHTML = `
                <div class="world-header">
                    <div class="world-icon">\u{1F5DD}\uFE0F</div>
                    <div class="world-info">
                        <h3>The Hidden Vault</h3>
                        <p>A secret level unlocked with your keys!</p>
                    </div>
                </div>
                <div class="levels-grid">
                    <div class="level-card secret" id="secret-level-card">
                        <div class="level-number">SECRET</div>
                        <h4>${GameData.secretLevel.name}</h4>
                        <div class="level-enemy">${GameData.secretLevel.enemy.avatar} ${GameData.secretLevel.enemy.name}</div>
                        <span class="level-badge secret-badge">SECRET</span>
                    </div>
                </div>
            `;
            worldsList.appendChild(secretCard);
            document.getElementById('secret-level-card').addEventListener('click', () => Game.startBattle('secret'));
        }
    },

    isWorldComplete(worldIndex) {
        const world = GameData.worlds[worldIndex];
        if (!world) return false;
        return world.levels.every(l => Game.state.completedLevels.includes(l.id));
    },

    // ---- Battle Screen ----
    renderBattleStart(level, world) {
        const state = Game.state;
        const charData = GameData.characters.find(c => c.id === state.characterId);

        // Level info
        document.getElementById('battle-level-name').textContent = level.name;
        document.getElementById('battle-world-name').textContent = world ? world.name : 'Secret';

        // Player
        document.getElementById('player-sprite').textContent = charData.avatar;
        document.getElementById('battle-player-name').textContent = state.playerName;
        this.updatePlayerHealth();
        this.updateSpecialBar();

        // Enemy
        document.getElementById('enemy-sprite').textContent = level.enemy.avatar;
        document.getElementById('battle-enemy-name').textContent = level.enemy.name;
        this.updateEnemyHealth();

        // Reset
        document.getElementById('battle-turn').textContent = '1';
        document.getElementById('combo-indicator').style.display = 'none';
        document.getElementById('battle-result').style.display = 'none';
        document.getElementById('battle-message').style.display = 'none';
        document.getElementById('damage-numbers').innerHTML = '';

        // Fighter classes
        document.getElementById('fighter-player').className = 'fighter fighter-player';
        document.getElementById('fighter-enemy').className = 'fighter fighter-enemy';
    },

    updatePlayerHealth() {
        const battle = Game.battle;
        if (!battle) return;
        const pct = Math.max(0, (battle.playerHp / battle.playerMaxHp) * 100);
        const fill = document.getElementById('player-health-fill');
        fill.style.width = pct + '%';
        fill.classList.toggle('low', pct < 30);
        document.getElementById('player-health-text').textContent =
            `${Math.max(0, Math.round(battle.playerHp))}/${battle.playerMaxHp}`;
    },

    updateEnemyHealth() {
        const battle = Game.battle;
        if (!battle) return;
        const pct = Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100);
        document.getElementById('enemy-health-fill').style.width = pct + '%';
        document.getElementById('enemy-health-text').textContent =
            `${Math.max(0, Math.round(battle.enemyHp))}/${battle.enemyMaxHp}`;
    },

    updateSpecialBar() {
        const battle = Game.battle;
        if (!battle) return;
        const pct = Math.min(100, (battle.specialCharge / battle.specialMaxCharge) * 100);
        const fill = document.getElementById('player-special-fill');
        fill.style.width = pct + '%';
        fill.classList.toggle('ready', pct >= 100);
    },

    updateCombo(combo) {
        const indicator = document.getElementById('combo-indicator');
        if (combo > 1) {
            indicator.style.display = 'inline';
            document.getElementById('combo-count').textContent = combo;
        } else {
            indicator.style.display = 'none';
        }
    },

    updateTurn(turn) {
        document.getElementById('battle-turn').textContent = turn;
    },

    // ---- Question Rendering ----
    renderQuestion(problem) {
        document.getElementById('question-category').textContent =
            this.getCategoryLabel(problem);
        const diffEl = document.getElementById('question-difficulty');
        if (problem.isBonus) {
            diffEl.textContent = 'BONUS';
            diffEl.className = 'question-difficulty bonus';
        } else {
            diffEl.textContent = Game.currentLevel.difficulty;
            diffEl.className = `question-difficulty ${Game.currentLevel.difficulty === 'hard' ? 'hard' : Game.currentLevel.difficulty === 'medium' ? 'medium' : ''}`;
        }

        document.getElementById('question-text').textContent = problem.question;
        document.getElementById('question-hint').style.display = 'none';

        // Show hint button if player has hint scrolls
        const hintBtn = document.getElementById('btn-use-hint');
        const hasHints = (Game.state.inventory.hint_scroll || 0) > 0;
        hintBtn.style.display = hasHints ? 'inline-block' : 'none';

        // Show item button if player has items
        const itemBtn = document.getElementById('btn-use-item');
        const hasItems = Object.values(Game.state.inventory).some(v => v > 0);
        itemBtn.style.display = hasItems ? 'inline-block' : 'none';

        // Render answer options
        const answerArea = document.getElementById('answer-area');
        answerArea.innerHTML = '';

        if (problem.type === 'multiple_choice') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'answer-options';
            problem.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'answer-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => {
                    optionsDiv.querySelectorAll('.answer-option').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    Game.selectedAnswer = String(opt);
                    document.getElementById('btn-submit-answer').disabled = false;
                });
                optionsDiv.appendChild(btn);
            });
            answerArea.appendChild(optionsDiv);
        } else {
            const container = document.createElement('div');
            container.className = 'answer-input-container';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'answer-input';
            input.placeholder = 'Type your answer...';
            input.autocomplete = 'off';
            input.addEventListener('input', () => {
                Game.selectedAnswer = input.value.trim();
                document.getElementById('btn-submit-answer').disabled = !input.value.trim();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    Game.submitAnswer();
                }
            });
            container.appendChild(input);
            answerArea.appendChild(container);
            setTimeout(() => input.focus(), 200);
        }

        document.getElementById('btn-submit-answer').disabled = true;
        Game.selectedAnswer = null;
    },

    getCategoryLabel(problem) {
        const q = problem.question.toLowerCase();
        if (q.includes('fraction') || q.includes('/')) return 'Fractions';
        if (q.includes('percent')) return 'Percentages';
        if (q.includes('solve for') || q.includes('solve:')) return 'Algebra';
        if (q.includes('area') || q.includes('perimeter')) return 'Geometry';
        if (q.includes('angle')) return 'Angles';
        if (q.includes('triangle') || q.includes('hypotenuse') || q.includes('leg')) return 'Pythagoras';
        if (q.includes('mean') || q.includes('median') || q.includes('mode')) return 'Statistics';
        if (q.includes('probability') || q.includes('die') || q.includes('coin') || q.includes('bag')) return 'Probability';
        if (q.includes('\u221A') || q.includes('\u00B2') || q.includes('\u00B3')) return 'Powers & Roots';
        if (q.includes('ratio') || q.includes('divide') && q.includes('ratio')) return 'Ratios';
        if (q.includes('bodmas') || q.includes('(')) return 'BODMAS';
        if (q.includes('if x =')) return 'Expressions';
        return 'Arithmetic';
    },

    // ---- Show answer result ----
    showAnswerResult(correct, problem, damage) {
        const answerArea = document.getElementById('answer-area');
        const options = answerArea.querySelectorAll('.answer-option');

        if (options.length > 0) {
            options.forEach(btn => {
                if (String(btn.textContent) === String(problem.correctAnswer)) {
                    btn.classList.add('correct');
                }
                if (btn.classList.contains('selected') && !correct) {
                    btn.classList.add('incorrect');
                }
                btn.style.pointerEvents = 'none';
            });
        } else {
            const input = answerArea.querySelector('.answer-input');
            if (input) {
                input.classList.add(correct ? 'correct' : 'incorrect');
                input.disabled = true;
                if (!correct) {
                    const correctLabel = document.createElement('div');
                    correctLabel.style.cssText = 'color: var(--accent-green); margin-top: 8px; font-family: var(--font-mono);';
                    correctLabel.textContent = `Correct answer: ${problem.correctAnswer}`;
                    answerArea.appendChild(correctLabel);
                }
            }
        }

        document.getElementById('btn-submit-answer').disabled = true;
    },

    // ---- Animations ----
    showDamageNumber(value, isPlayerDamage, isCritical = false) {
        const container = document.getElementById('damage-numbers');
        const num = document.createElement('div');
        num.className = `damage-number ${isPlayerDamage ? 'player-damage' : 'enemy-damage'} ${isCritical ? 'critical' : ''}`;
        num.textContent = (isPlayerDamage ? '-' : '+') + Math.round(Math.abs(value));
        if (value > 0 && isPlayerDamage) num.textContent = '-' + Math.round(value);
        if (!isPlayerDamage) num.textContent = '-' + Math.round(value);

        // Position near the target
        const targetId = isPlayerDamage ? 'fighter-player' : 'fighter-enemy';
        const target = document.getElementById(targetId);
        const rect = target.getBoundingClientRect();
        num.style.left = (rect.left + rect.width / 2 - 30 + Math.random() * 60) + 'px';
        num.style.top = (rect.top + 20) + 'px';
        container.appendChild(num);
        setTimeout(() => num.remove(), 1200);
    },

    showHealNumber(value) {
        const container = document.getElementById('damage-numbers');
        const num = document.createElement('div');
        num.className = 'damage-number heal';
        num.textContent = '+' + Math.round(value);
        const target = document.getElementById('fighter-player');
        const rect = target.getBoundingClientRect();
        num.style.left = (rect.left + rect.width / 2) + 'px';
        num.style.top = (rect.top + 20) + 'px';
        container.appendChild(num);
        setTimeout(() => num.remove(), 1200);
    },

    playAttackAnimation(isPlayer) {
        const fighter = document.getElementById(isPlayer ? 'fighter-player' : 'fighter-enemy');
        const target = document.getElementById(isPlayer ? 'fighter-enemy' : 'fighter-player');
        fighter.classList.add('attacking');
        setTimeout(() => {
            fighter.classList.remove('attacking');
            target.classList.add('hit');
            this.screenShake();
            setTimeout(() => target.classList.remove('hit'), 400);
        }, 300);
    },

    playDefeatAnimation(isPlayer) {
        const fighter = document.getElementById(isPlayer ? 'fighter-player' : 'fighter-enemy');
        fighter.classList.add('defeated');
    },

    screenShake() {
        const container = document.getElementById('screen-battle');
        container.classList.add('screen-shake');
        setTimeout(() => container.classList.remove('screen-shake'), 300);
    },

    showBattleMessage(msg, duration = 2000) {
        const el = document.getElementById('battle-message');
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, duration);
    },

    // ---- Timer ----
    startTimer(seconds, onTick, onExpire) {
        this.stopTimer();
        let remaining = seconds;
        const timerEl = document.getElementById('question-timer');
        timerEl.textContent = remaining;
        timerEl.classList.remove('urgent');

        this._timer = setInterval(() => {
            remaining--;
            timerEl.textContent = remaining;
            if (remaining <= 5) timerEl.classList.add('urgent');
            if (onTick) onTick(remaining);
            if (remaining <= 0) {
                this.stopTimer();
                if (onExpire) onExpire();
            }
        }, 1000);

        this._timerStart = Date.now();
        return this._timerStart;
    },

    stopTimer() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    },

    getElapsedTime() {
        if (!this._timerStart) return 0;
        return (Date.now() - this._timerStart) / 1000;
    },

    // ---- Victory Screen ----
    renderVictory(results) {
        document.getElementById('victory-title').textContent =
            results.isBoss ? 'Boss Defeated!' : 'Victory!';

        // Stars
        const starsDiv = document.getElementById('victory-stars');
        starsDiv.innerHTML = [1, 2, 3].map(s =>
            `<span class="${s <= results.stars ? 'star-filled' : 'star-empty'}">\u2605</span>`
        ).join('');

        // Stats
        const statsDiv = document.getElementById('victory-stats');
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Questions Correct</span>
                <span class="stat-value">${results.correctAnswers}/${results.totalQuestions}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Combo</span>
                <span class="stat-value">${results.bestCombo}x</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Gold Earned</span>
                <span class="stat-value gold">+${results.goldEarned}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">XP Earned</span>
                <span class="stat-value xp">+${results.xpEarned}</span>
            </div>
        `;

        // Rewards
        const rewardsDiv = document.getElementById('victory-rewards');
        let rewardsHtml = '<h4>Rewards</h4>';
        results.rewards.forEach(r => {
            rewardsHtml += `<div class="reward-item">${r}</div>`;
        });
        rewardsDiv.innerHTML = rewardsHtml;

        // Secret
        const secretDiv = document.getElementById('victory-secret');
        if (results.secretFound) {
            secretDiv.style.display = 'block';
            secretDiv.innerHTML = `
                <h4>\u{1F511} Secret Discovered!</h4>
                <p>${results.secretFound}</p>
            `;
        } else {
            secretDiv.style.display = 'none';
        }

        // Level up notification
        if (results.leveledUp) {
            setTimeout(() => this.showLevelUpAnimation(results.newLevel), 500);
        }
    },

    showLevelUpAnimation(level) {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `
            <div class="level-up-content">
                <h2>LEVEL UP!</h2>
                <p>You are now Level ${level}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s';
            setTimeout(() => overlay.remove(), 500);
        }, 2000);
    },

    // ---- Defeat Screen ----
    renderDefeat(results) {
        const reviewDiv = document.getElementById('defeat-review');
        if (results.wrongAnswers.length > 0) {
            let html = '<h4>Review Your Mistakes</h4>';
            results.wrongAnswers.forEach(wa => {
                html += `
                    <div class="review-item">
                        <div class="review-question">${wa.question}</div>
                        <div class="review-answer">Correct: ${wa.correctAnswer}</div>
                    </div>
                `;
            });
            reviewDiv.innerHTML = html;
        } else {
            reviewDiv.innerHTML = '<p style="color: var(--text-muted);">You ran out of HP!</p>';
        }
    },

    // ---- Shop ----
    renderShop() {
        document.getElementById('shop-gold').textContent = Game.state.gold;
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';
        GameData.shopItems.forEach(item => {
            const owned = Game.state.inventory[item.id] || 0;
            const canBuy = Game.state.gold >= item.price && owned < item.maxStack;
            const card = document.createElement('div');
            card.className = `shop-item ${canBuy ? '' : 'sold-out'}`;
            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p style="font-size:0.7rem;color:var(--text-muted)">Owned: ${owned}/${item.maxStack}</p>
                <div class="shop-price">${item.price} Gold</div>
            `;
            if (canBuy) {
                card.addEventListener('click', () => {
                    Game.buyItem(item.id);
                    this.renderShop();
                });
            }
            grid.appendChild(card);
        });
    },

    // ---- Inventory ----
    renderInventory() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        let hasItems = false;
        Object.entries(Game.state.inventory).forEach(([id, count]) => {
            if (count <= 0) return;
            hasItems = true;
            const itemData = GameData.shopItems.find(i => i.id === id);
            if (!itemData) return;
            const card = document.createElement('div');
            card.className = 'inventory-item';
            card.innerHTML = `
                <div class="inventory-item-icon">${itemData.icon}</div>
                <h4>${itemData.name}</h4>
                <span class="item-count">\u00D7${count}</span>
            `;
            grid.appendChild(card);
        });
        if (!hasItems) {
            grid.innerHTML = '<div class="empty-inventory">No items yet. Visit the shop!</div>';
        }
    },

    // ---- Achievements ----
    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';
        GameData.achievements.forEach(ach => {
            const unlocked = Game.state.achievements.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${unlocked ? ach.icon : '\u{1F512}'}</div>
                <div class="achievement-info">
                    <h4>${ach.name}</h4>
                    <p>${unlocked ? ach.description : '???'}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // ---- Item Use During Battle ----
    showItemMenu() {
        const overlay = document.getElementById('battle-result');
        const content = document.getElementById('result-content');
        let html = '<h3>Use Item</h3><div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">';
        let hasUsableItems = false;

        Object.entries(Game.state.inventory).forEach(([id, count]) => {
            if (count <= 0) return;
            const itemData = GameData.shopItems.find(i => i.id === id);
            if (!itemData) return;
            // Only show usable battle items
            if (['heal', 'time', 'shield', 'power', 'eliminate'].includes(itemData.effect.type)) {
                hasUsableItems = true;
                html += `<button class="btn btn-secondary" onclick="Game.useItem('${id}')" style="text-align:left">
                    ${itemData.icon} ${itemData.name} (\u00D7${count}) - ${itemData.description}
                </button>`;
            }
        });

        if (!hasUsableItems) {
            html += '<p style="color:var(--text-muted)">No usable items</p>';
        }

        html += `<button class="btn btn-ghost" onclick="document.getElementById('battle-result').style.display='none'" style="margin-top:8px">Cancel</button>`;
        html += '</div>';
        content.innerHTML = html;
        overlay.style.display = 'flex';
    }
};
