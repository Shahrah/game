/* ============================================
   APP - Entry Point for Science Battle 3D
   ============================================ */
(function () {
    'use strict';

    window.addEventListener('DOMContentLoaded', () => {
        // Initialize 3D engine
        Engine3D.init();

        // Initialize game logic
        Game.init();

        // Start title screen animation
        function animateTitle() {
            if (Game.mode === 'title') {
                Engine3D.renderTitleBackground();
            }
            requestAnimationFrame(animateTitle);
        }
        animateTitle();

        // Start game loop
        Game.loop(0);

        // Handle visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && Game.battleTimer) {
                clearInterval(Game.battleTimer);
            }
        });

        // Prevent context menu on game canvas
        document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());

        // Initial audio context activation on first interaction
        document.addEventListener('click', function initAudio() {
            Sound.getContext();
            document.removeEventListener('click', initAudio);
        }, { once: true });

        console.log('معركة العلوم: فتح المدن - تم التحميل بنجاح!');
    });
})();
