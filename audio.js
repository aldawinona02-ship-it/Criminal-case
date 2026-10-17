/**
 * THE LAST CASE - Environmental & Atmospheric Audio Engine
 * Pure Web Audio API: rain, distant thunder, facility hum, blast door clang, heartbeat pulse.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.humNode = null;
        this.humGain = null;
        this.rainNode = null;
        this.rainGain = null;
        this.isHumming = false;
        this.isRaining = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _ensureCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    // Low-frequency facility drone
    startHum() {
        if (!this.ctx || this.isHumming || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            this.humNode = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            this.humGain = this.ctx.createGain();

            this.humNode.type = 'sawtooth';
            this.humNode.frequency.setValueAtTime(54, now); // Deep 54Hz transformer hum

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(110, now);

            this.humGain.gain.setValueAtTime(0.001, now);
            this.humGain.gain.linearRampToValueAtTime(0.045, now + 2.5);

            this.humNode.connect(filter);
            filter.connect(this.humGain);
            this.humGain.connect(this.ctx.destination);

            this.humNode.start();
            this.isHumming = true;
        } catch (e) {
            console.warn("Audio hum error:", e);
        }
    }

    stopHum() {
        if (this.humGain && this.ctx) {
            try {
                this.humGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
                setTimeout(() => {
                    if (this.humNode) {
                        this.humNode.stop();
                        this.humNode.disconnect();
                    }
                    this.isHumming = false;
                }, 700);
            } catch (e) {}
        }
    }

    // Realistic rain generator using pink/white noise + lowpass filter
    startRain() {
        if (!this.ctx || this.isRaining || this.isMuted) return;
        try {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Brown/pink noise filter
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }

            this.rainNode = this.ctx.createBufferSource();
            this.rainNode.buffer = buffer;
            this.rainNode.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);

            this.rainGain = this.ctx.createGain();
            this.rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.rainGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2);

            this.rainNode.connect(filter);
            filter.connect(this.rainGain);
            this.rainGain.connect(this.ctx.destination);

            this.rainNode.start();
            this.isRaining = true;
        } catch (e) {
            console.warn("Rain audio error:", e);
        }
    }

    stopRain() {
        if (this.rainGain && this.ctx) {
            try {
                this.rainGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
                setTimeout(() => {
                    if (this.rainNode) {
                        this.rainNode.stop();
                        this.rainNode.disconnect();
                    }
                    this.isRaining = false;
                }, 1300);
            } catch (e) {}
        }
    }

    // Distant mountain thunder rumble
    playThunder() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 2.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(90, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.9);
    }

    // Heavy mechanical security blast door CLANG
    playDoorClang() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Sub thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
        oscGain.gain.setValueAtTime(0.25, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);

        // Metallic impact noise
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(3, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
    }

    // Heartbeat sub-bass pulse
    playHeartbeat() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        [0, 0.18].forEach(offset => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, now + offset);
            osc.frequency.exponentialRampToValueAtTime(32, now + offset + 0.14);

            gain.gain.setValueAtTime(0.2, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.16);
        });
    }

    // Static burst for 02:13 blackout
    playStatic() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.22;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(now);
    }

    // Subtle UI click / keypress
    playClick() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
    }

    // Evidence logged chime
    playEvidenceScan() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        [880, 1174.66].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.06, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.2);
        });
    }

    // Puzzle tile snap click
    playSnap() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Success chord
    playSuccess() {
        if (this.isMuted || !this.ctx) return;
        const notes = [440, 554.37, 659.25]; // A major
        notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        });
    }

    // ==========================================================================
    // ROUND 2: DIGITAL & CYBER INVESTIGATION AUDIO
    // ==========================================================================

    // Start server room cooling fan & electrical buzz
    startServerAmbience() {
        if (!this.ctx || this.isMuted) return;
        try {
            this.serverOsc = this.ctx.createOscillator();
            this.serverGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            this.serverOsc.type = 'triangle';
            this.serverOsc.frequency.setValueAtTime(72, this.ctx.currentTime); // 72Hz electrical hum
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(140, this.ctx.currentTime);

            this.serverGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.serverGain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 1.8);

            this.serverOsc.connect(filter);
            filter.connect(this.serverGain);
            this.serverGain.connect(this.ctx.destination);
            this.serverOsc.start();
        } catch (e) {}
    }

    stopServerAmbience() {
        if (this.serverGain && this.ctx) {
            try {
                this.serverGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
                setTimeout(() => {
                    if (this.serverOsc) {
                        this.serverOsc.stop();
                        this.serverOsc.disconnect();
                    }
                }, 600);
            } catch (e) {}
        }
    }

    // High-tech terminal keystroke
    playKeypress() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
    }

    // Digital Glitch / System anomaly sound
    playGlitch() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(840, now + 0.04);
        osc.frequency.setValueAtTime(320, now + 0.09);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Data packet decrypted chord
    playDecrypted() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.04, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.3);
        });
    }

    // ── ROUND 3 AUDIO ────────────────────────────────────────────────────────

    startP9Ambience() {
        this._ensureCtx();
        if (this._p9OscNode) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 48; // very low resonant hum
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2.5);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start();
            this._p9OscNode = osc;
            this._p9GainNode = gain;
        } catch(e) {}
    }

    stopP9Ambience() {
        if (!this._p9OscNode) return;
        try {
            this._p9GainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
            const o = this._p9OscNode;
            setTimeout(() => { try { o.stop(); } catch(e){} }, 1600);
            this._p9OscNode = null;
            this._p9GainNode = null;
        } catch(e) {}
    }

    playHeartbeatPulse() {
        this._ensureCtx();
        try {
            const now = this.ctx.currentTime;
            [0, 0.15].forEach(offset => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.value = 80;
                gain.gain.setValueAtTime(0, now + offset);
                gain.gain.linearRampToValueAtTime(0.22, now + offset + 0.04);
                gain.gain.linearRampToValueAtTime(0, now + offset + 0.18);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.25);
            });
        } catch(e) {}
    }

    playMechanicalUnlock() {
        this._ensureCtx();
        try {
            const now = this.ctx.currentTime;
            const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.4;
            }
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            src.buffer = buf;
            gain.gain.value = 0.5;
            src.connect(gain); gain.connect(this.ctx.destination);
            src.start(now);
        } catch(e) {}
    }

    playEvidenceConnect() {
        this._ensureCtx();
        try {
            const now = this.ctx.currentTime;
            [523, 659, 784].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, now + idx * 0.09);
                gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.09 + 0.03);
                gain.gain.linearRampToValueAtTime(0, now + idx * 0.09 + 0.25);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.09);
                osc.stop(now + idx * 0.09 + 0.3);
            });
        } catch(e) {}
    }

    playP9Activate() {
        this._ensureCtx();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(60, now);
            osc.frequency.linearRampToValueAtTime(320, now + 0.8);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 1.2);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 1.3);
        } catch(e) {}
    }

    playCinematicImpact() {
        this._ensureCtx();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(55, now + 1.6);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
            gain.gain.linearRampToValueAtTime(0, now + 2.0);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 2.1);
        } catch(e) {}
    }
}

window.sound = new SoundEngine();
