/* ============================================
   SOUND ENGINE - Web Audio API
   Procedural sound effects for 3D game
   ============================================ */

const Sound = {
    enabled: true,
    ctx: null,
    volume: 0.3,

    getContext() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                this.enabled = false;
            }
        }
        return this.ctx;
    },

    toggle() {
        this.enabled = !this.enabled;
    },

    play(name) {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        try {
            switch (name) {
                case 'click': this.playTone(ctx, 800, 0.05, 'sine', 0.15); break;
                case 'select':
                    this.playTone(ctx, 600, 0.1, 'sine', 0.2);
                    this.playTone(ctx, 900, 0.1, 'sine', 0.15, 0.05);
                    break;
                case 'correct':
                    this.playTone(ctx, 523, 0.1, 'sine', 0.25);
                    this.playTone(ctx, 659, 0.1, 'sine', 0.25, 0.1);
                    this.playTone(ctx, 784, 0.15, 'sine', 0.3, 0.2);
                    break;
                case 'wrong':
                    this.playTone(ctx, 300, 0.15, 'sawtooth', 0.2);
                    this.playTone(ctx, 200, 0.2, 'sawtooth', 0.2, 0.1);
                    break;
                case 'battleStart':
                    this.playTone(ctx, 200, 0.1, 'square', 0.3);
                    this.playTone(ctx, 300, 0.1, 'square', 0.3, 0.1);
                    this.playTone(ctx, 400, 0.1, 'square', 0.3, 0.2);
                    this.playTone(ctx, 600, 0.2, 'square', 0.4, 0.3);
                    break;
                case 'victory':
                    [523, 659, 784, 1047].forEach((f, i) => {
                        this.playTone(ctx, f, 0.15, 'sine', 0.3, i * 0.12);
                    });
                    break;
                case 'defeat':
                    this.playTone(ctx, 400, 0.3, 'sawtooth', 0.2);
                    this.playTone(ctx, 300, 0.3, 'sawtooth', 0.2, 0.2);
                    this.playTone(ctx, 200, 0.5, 'sawtooth', 0.3, 0.4);
                    break;
                case 'levelUp':
                    [400, 500, 600, 700, 800, 1000].forEach((f, i) => {
                        this.playTone(ctx, f, 0.1, 'sine', 0.25, i * 0.08);
                    });
                    break;
                case 'chest':
                    this.playTone(ctx, 600, 0.1, 'sine', 0.2);
                    this.playTone(ctx, 800, 0.1, 'sine', 0.2, 0.1);
                    this.playTone(ctx, 1000, 0.15, 'sine', 0.25, 0.2);
                    break;
                case 'buy':
                    this.playTone(ctx, 500, 0.08, 'sine', 0.2);
                    this.playTone(ctx, 700, 0.08, 'sine', 0.2, 0.08);
                    break;
                case 'dialog':
                    this.playTone(ctx, 400, 0.05, 'sine', 0.1);
                    break;
                case 'shop':
                    this.playTone(ctx, 350, 0.08, 'triangle', 0.15);
                    this.playTone(ctx, 500, 0.08, 'triangle', 0.15, 0.08);
                    break;
                case 'hint':
                    this.playTone(ctx, 700, 0.1, 'sine', 0.15);
                    this.playTone(ctx, 900, 0.1, 'sine', 0.15, 0.1);
                    break;
            }
        } catch (e) { /* ignore audio errors */ }
    },

    playTone(ctx, freq, duration, type, vol, delay) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.value = (vol || 0.2) * this.volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startTime = ctx.currentTime + (delay || 0);
        osc.start(startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.stop(startTime + duration + 0.01);
    }
};
