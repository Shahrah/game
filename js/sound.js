/* ============================================
   SOUND ENGINE - Web Audio API
   Procedural sounds, no external files needed
   ============================================ */
const Sound = {
    ctx: null,
    enabled: true,
    masterVol: null,
    musicGain: null,
    sfxGain: null,
    _musicOscs: [],

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterVol = this.ctx.createGain();
            this.masterVol.gain.value = 0.5;
            this.masterVol.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.25;
            this.musicGain.connect(this.masterVol);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterVol);
        } catch (e) { this.enabled = false; }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggle() {
        this.enabled = !this.enabled;
        if (this.masterVol) this.masterVol.gain.value = this.enabled ? 0.5 : 0;
        return this.enabled;
    },

    // ---- Play a note ----
    _note(freq, duration, type, gain, dest) {
        if (!this.ctx || !this.enabled) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || 'square';
        o.frequency.value = freq;
        g.gain.setValueAtTime(gain || 0.3, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        o.connect(g);
        g.connect(dest || this.sfxGain);
        o.start(this.ctx.currentTime);
        o.stop(this.ctx.currentTime + duration);
    },

    // ---- SFX ----
    walk() {
        if (!this.ctx || !this.enabled) return;
        this._note(200 + Math.random() * 60, 0.06, 'triangle', 0.08);
    },

    select() {
        this._note(600, 0.08, 'square', 0.15);
        setTimeout(() => this._note(800, 0.08, 'square', 0.12), 60);
    },

    confirm() {
        this._note(523, 0.1, 'square', 0.15);
        setTimeout(() => this._note(659, 0.1, 'square', 0.15), 80);
        setTimeout(() => this._note(784, 0.15, 'square', 0.12), 160);
    },

    error() {
        this._note(200, 0.15, 'sawtooth', 0.15);
        setTimeout(() => this._note(150, 0.2, 'sawtooth', 0.12), 120);
    },

    attack() {
        if (!this.ctx || !this.enabled) return;
        // Noise burst for hit
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start();
        this._note(300, 0.08, 'sawtooth', 0.2);
    },

    hit() {
        this._note(120, 0.15, 'sawtooth', 0.25);
        this._note(80, 0.2, 'square', 0.15);
    },

    heal() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.2, 'sine', 0.12), i * 80);
        });
    },

    victory() {
        const melody = [523, 659, 784, 1047, 784, 1047];
        melody.forEach((f, i) => {
            setTimeout(() => this._note(f, 0.2, 'square', 0.15), i * 120);
        });
    },

    defeat() {
        [400, 350, 300, 200].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.3, 'sawtooth', 0.12), i * 200);
        });
    },

    chest() {
        [440, 554, 659, 880].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.25, 'triangle', 0.15), i * 100);
        });
    },

    levelUp() {
        const notes = [523, 659, 784, 1047, 1319, 1568];
        notes.forEach((f, i) => {
            setTimeout(() => this._note(f, 0.15, 'square', 0.12), i * 80);
        });
    },

    combo() {
        this._note(880, 0.1, 'square', 0.12);
        setTimeout(() => this._note(1100, 0.12, 'square', 0.1), 60);
    },

    doorOpen() {
        this._note(200, 0.2, 'triangle', 0.12);
        setTimeout(() => this._note(400, 0.3, 'triangle', 0.1), 150);
    },

    npcTalk() {
        const f = 300 + Math.random() * 200;
        this._note(f, 0.05, 'square', 0.08);
    },

    // ---- Background Music ----
    _currentMusic: null,

    playMusic(type) {
        this.stopMusic();
        if (!this.ctx || !this.enabled) return;
        this._currentMusic = type;
        switch (type) {
            case 'village': this._playVillageMusic(); break;
            case 'forest': this._playForestMusic(); break;
            case 'cave': this._playCaveMusic(); break;
            case 'castle': this._playCastleMusic(); break;
            case 'battle': this._playBattleMusic(); break;
            case 'boss': this._playBossMusic(); break;
        }
    },

    stopMusic() {
        this._musicOscs.forEach(o => { try { o.stop(); } catch (e) {} });
        this._musicOscs = [];
        this._currentMusic = null;
        if (this._musicInterval) { clearInterval(this._musicInterval); this._musicInterval = null; }
    },

    _loopMelody(notes, tempo, type, vol) {
        let i = 0;
        const play = () => {
            if (!this.enabled || !this._currentMusic) return;
            const n = notes[i % notes.length];
            if (n > 0) this._note(n, tempo / 1000 * 0.8, type || 'square', vol || 0.08, this.musicGain);
            i++;
        };
        play();
        this._musicInterval = setInterval(play, tempo);
    },

    _playVillageMusic() {
        // Gentle pleasant melody
        const notes = [392, 440, 494, 523, 494, 440, 392, 349, 330, 349, 392, 440, 392, 349, 330, 294];
        this._loopMelody(notes, 300, 'triangle', 0.06);
    },

    _playForestMusic() {
        const notes = [330, 0, 392, 330, 0, 294, 330, 392, 440, 0, 392, 330, 294, 0, 262, 294];
        this._loopMelody(notes, 350, 'triangle', 0.05);
    },

    _playCaveMusic() {
        const notes = [196, 0, 0, 220, 0, 196, 0, 175, 0, 0, 196, 0, 165, 0, 0, 147];
        this._loopMelody(notes, 400, 'sine', 0.05);
    },

    _playCastleMusic() {
        const notes = [440, 523, 659, 523, 440, 392, 440, 523, 587, 659, 587, 523, 440, 392, 349, 392];
        this._loopMelody(notes, 280, 'square', 0.05);
    },

    _playBattleMusic() {
        const notes = [330, 330, 392, 330, 294, 330, 392, 440, 494, 440, 392, 330, 294, 262, 294, 330];
        this._loopMelody(notes, 200, 'square', 0.06);
    },

    _playBossMusic() {
        const notes = [220, 220, 262, 220, 196, 220, 262, 294, 330, 294, 262, 220, 196, 175, 196, 220];
        this._loopMelody(notes, 180, 'sawtooth', 0.04);
    }
};
