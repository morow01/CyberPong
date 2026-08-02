/* ==========================================================================
   Sound Synth & Melodic BGM Module (Web Audio API) - v2.1.0
   ========================================================================== */

class SoundSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.volume = 0.5;
        this.muted = false;
        this.initialized = false;

        // Melodic BGM State
        this.bgmEnabled = false;
        this.bgmTimer = null;
        this.bgmStep = 0;

        // 80s Synthwave Chord Sequence (Ambient Arpeggio & Chords)
        // Am (A3, C4, E4) -> F (F3, A3, C4) -> C (C4, E4, G4) -> G (G3, B3, D4)
        this.chords = [
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63], // F
            [261.63, 329.63, 392.00], // C
            [196.00, 246.94, 293.66]  // G
        ];
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    setMuted(isMuted) {
        this.muted = isMuted;
        this.setVolume(this.volume);
    }

    // --- Melodic BGM Engine --- //
    toggleBgm() {
        this.init();
        this.bgmEnabled = !this.bgmEnabled;

        if (this.bgmEnabled) {
            this.startBgmLoop();
        } else {
            this.stopBgmLoop();
        }
        return this.bgmEnabled;
    }

    startBgmLoop() {
        this.stopBgmLoop();
        this.bgmStep = 0;

        // Play chord beat every 800ms
        this.bgmTimer = setInterval(() => {
            if (this.bgmEnabled && !this.muted && this.ctx) {
                this.playMelodicChordStep();
            }
        }, 800);
    }

    stopBgmLoop() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playMelodicChordStep() {
        if (!this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const chordIndex = Math.floor(this.bgmStep / 4) % this.chords.length;
        const chord = this.chords[chordIndex];
        const noteFreq = chord[this.bgmStep % chord.length];
        this.bgmStep++;

        // Filtered soft sine oscillator for ambient retro feel
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.08); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7); // Gentle release

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.75);
    }

    setBgmSpeed(multiplier = 1.0) {
        // Keeps ambient tempo smooth
    }

    // --- Sound Effects --- //

    // Ball Bounce (Wall or Paddle)
    playBounce(isPaddle = false, pitchMultiplier = 1.0) {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = isPaddle ? 320 * pitchMultiplier : 220 * pitchMultiplier;
        osc.type = isPaddle ? 'triangle' : 'sine';

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.05);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Pinball Bumper Bounce
    playBumper() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Ultimate Ability Cosmic Swell
    playUltimate() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880, 1108.73];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.25, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.4);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.45);
        });
    }

    // Goal Scored
    playScore(isP1) {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = isP1 ? [440, 554.37, 659.25, 880] : [349.23, 440, 523.25, 698.46];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.25);
        });
    }

    // Power-Up Pickup Arpeggio
    playPowerup() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.25, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.12);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.15);
        });
    }

    // Laser Blast
    playLaser() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Shield Hit
    playShield() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.15);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Frost Effect
    playFreeze() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Victory Fanfare
    playVictory() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50];

        chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 1.2);
        });
    }
}

// Global Singleton Instance
window.sound = new SoundSynth();
