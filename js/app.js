/* ============================================
   MAIN APP - Entry Point & Event Bindings
   ============================================ */

(function () {
    'use strict';

    // ---- Initialize Game ----
    Game.init();

    // ---- Title Screen ----
    const btnNewGame = document.getElementById('btn-new-game');
    const btnContinue = document.getElementById('btn-continue');
    const btnHowToPlay = document.getElementById('btn-how-to-play');

    // Show continue button if save exists
    if (Game.hasSaveData()) {
        btnContinue.style.display = 'block';
    }

    btnNewGame.addEventListener('click', () => {
        UI.switchScreen('screen-character');
        UI.renderCharacterSelect();
    });

    btnContinue.addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    btnHowToPlay.addEventListener('click', () => {
        UI.switchScreen('screen-tutorial');
    });

    // ---- Tutorial Screen ----
    document.getElementById('btn-tutorial-back').addEventListener('click', () => {
        UI.switchScreen('screen-title');
    });

    // ---- Character Select ----
    document.getElementById('btn-start-adventure').addEventListener('click', () => {
        const name = document.getElementById('player-name').value.trim() || 'Warrior';
        if (!Game.selectedCharacterId) {
            UI.notify('Please select a character!', 'warning');
            return;
        }
        Game.startNewGame(name, Game.selectedCharacterId);
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
        UI.notify(`Welcome, ${name}! Your journey begins...`, 'info', 4000);
    });

    // ---- World Map Buttons ----
    document.getElementById('btn-shop').addEventListener('click', () => {
        UI.switchScreen('screen-shop');
        UI.renderShop();
    });

    document.getElementById('btn-achievements').addEventListener('click', () => {
        UI.switchScreen('screen-achievements');
        UI.renderAchievements();
    });

    document.getElementById('btn-inventory').addEventListener('click', () => {
        UI.switchScreen('screen-inventory');
        UI.renderInventory();
    });

    // ---- Shop ----
    document.getElementById('btn-shop-back').addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    // ---- Inventory ----
    document.getElementById('btn-inventory-back').addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    // ---- Achievements ----
    document.getElementById('btn-achievements-back').addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    // ---- Battle Screen ----
    document.getElementById('btn-submit-answer').addEventListener('click', () => {
        Game.submitAnswer();
    });

    document.getElementById('btn-use-hint').addEventListener('click', () => {
        Game.useHint();
    });

    document.getElementById('btn-use-item').addEventListener('click', () => {
        UI.showItemMenu();
    });

    // ---- Victory Screen ----
    document.getElementById('btn-next-level').addEventListener('click', () => {
        if (!Game.battle) return;
        const nextId = Game.getNextLevelId(Game.battle.levelId);
        if (nextId) {
            Game.startBattle(nextId);
        } else {
            UI.switchScreen('screen-map');
            UI.renderWorldMap();
            UI.notify('You have conquered all available levels!', 'success');
        }
    });

    document.getElementById('btn-back-to-map').addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    // ---- Defeat Screen ----
    document.getElementById('btn-retry').addEventListener('click', () => {
        if (Game.battle) {
            Game.startBattle(Game.battle.levelId);
        }
    });

    document.getElementById('btn-defeat-map').addEventListener('click', () => {
        UI.switchScreen('screen-map');
        UI.renderWorldMap();
    });

    // ---- Keyboard Shortcuts ----
    document.addEventListener('keydown', (e) => {
        // During battle, number keys select options
        if (Game.battle && Game.battle.isActive) {
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const options = document.querySelectorAll('.answer-option');
                const idx = parseInt(key) - 1;
                if (options[idx]) {
                    options[idx].click();
                }
            }
            if (key === 'Enter' && Game.selectedAnswer !== null) {
                Game.submitAnswer();
            }
            // S for special
            if (key === 's' || key === 'S') {
                if (Game.battle.specialCharge >= Game.battle.specialMaxCharge) {
                    Game.useSpecial();
                }
            }
        }
    });

    // ---- Special Attack Button (add dynamically to battle) ----
    const specialBtn = document.createElement('button');
    specialBtn.className = 'btn btn-small btn-ghost';
    specialBtn.id = 'btn-special-attack';
    specialBtn.textContent = 'Special (S)';
    specialBtn.style.display = 'none';
    document.querySelector('.question-actions').prepend(specialBtn);
    specialBtn.addEventListener('click', () => {
        Game.useSpecial();
    });

    // Update special button visibility
    const originalUpdateSpecial = UI.updateSpecialBar.bind(UI);
    UI.updateSpecialBar = function () {
        originalUpdateSpecial();
        if (Game.battle) {
            specialBtn.style.display =
                Game.battle.specialCharge >= Game.battle.specialMaxCharge ? 'inline-block' : 'none';
        }
    };

    // ---- Prevent accidental navigation ----
    window.addEventListener('beforeunload', (e) => {
        if (Game.battle && Game.battle.isActive) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // ---- Auto-save periodically ----
    setInterval(() => {
        if (Game.state) Game.saveState();
    }, 30000);

})();
