/* ============================================
   APP - Entry Point & Event Bindings
   ============================================ */
(function () {
    'use strict';

    // Initialize sound (must be after user interaction)
    let soundReady = false;
    function ensureSound() {
        if (!soundReady) { Sound.init(); soundReady = true; }
        Sound.resume();
    }

    // Initialize game engine
    Game.init();

    // Show continue button if save exists
    if (Game.hasSave()) {
        document.getElementById('btn-continue').style.display = 'block';
    }

    // ---- Title Screen ----
    document.getElementById('btn-new-game').addEventListener('click', () => {
        ensureSound();
        Sound.confirm();
        Game.hideOverlay('screen-title');
        Game.showOverlay('screen-charselect');
        Game.renderCharSelect();
    });

    document.getElementById('btn-continue').addEventListener('click', () => {
        ensureSound();
        Sound.confirm();
        Game.hideOverlay('screen-title');
        Game.enterExplore();
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
        ensureSound();
        Sound.select();
        Game.hideOverlay('screen-title');
        Game.showOverlay('screen-tutorial');
    });

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', () => {
        ensureSound();
        const on = Sound.toggle();
        document.getElementById('sound-toggle').textContent = `Sound: ${on ? 'ON' : 'OFF'}`;
    });

    // ---- Tutorial ----
    document.getElementById('btn-tut-back').addEventListener('click', () => {
        Sound.select();
        Game.hideOverlay('screen-tutorial');
        Game.showOverlay('screen-title');
    });

    // ---- Character Select ----
    document.getElementById('btn-start').addEventListener('click', () => {
        const name = document.getElementById('player-name').value.trim() || 'Warrior';
        if (!Game.selectedCharId) {
            Game.notify('Select a character!', 'error');
            return;
        }
        Sound.confirm();
        Game.startNewGame(name, Game.selectedCharId);
        Game.hideOverlay('screen-charselect');
        Game.enterExplore();
        Game.notify(`Welcome, ${name}! Talk to the Elder for guidance.`, 'info', 5000);
    });

    // ---- Battle ----
    document.getElementById('btn-submit').addEventListener('click', () => {
        Game.submitAnswer();
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
        Game.useHint();
    });

    // ---- Victory ----
    document.getElementById('btn-victory-continue').addEventListener('click', () => {
        Sound.select();
        Game.hideOverlay('screen-victory');
        Game.enterExplore();
    });

    // ---- Defeat ----
    document.getElementById('btn-retry').addEventListener('click', () => {
        Sound.select();
        Game.hideOverlay('screen-defeat');
        // Re-enter the map; enemy is still there
        Game.enterExplore();
    });

    document.getElementById('btn-retreat').addEventListener('click', () => {
        Sound.select();
        Game.hideOverlay('screen-defeat');
        Game.state.currentMap = 'village';
        Game.state.playerX = 14;
        Game.state.playerY = 18;
        Game.saveState();
        Game.enterExplore();
    });

    // ---- Shop ----
    document.getElementById('btn-shop-close').addEventListener('click', () => {
        Sound.select();
        Game.closeShop();
    });

    // ---- Inventory ----
    document.getElementById('btn-inv-close').addEventListener('click', () => {
        Sound.select();
        Game.closeInventory();
    });

    // ---- Escape key for menus ----
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (Game.mode === 'menu') {
                Game.hideAllOverlays();
                Game.mode = 'explore';
                Game.updateHUD();
            }
        }
    });

    // ---- Auto-save ----
    setInterval(() => { if (Game.state) Game.saveState(); }, 30000);

})();
