class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    createOscillator(frequency, type = 'sine') {
        if (!this.enabled || !this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        
        return { oscillator, gainNode };
    }

    playPieceDrop() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(80, 'square');
            if (!oscillator) return;

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(this.volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        });
    }

    playPieceRotate() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(400, 'square');
            if (!oscillator) return;

            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            
            oscillator.start(now);
            oscillator.stop(now + 0.05);
        });
    }

    playPieceMove() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(200, 'triangle');
            if (!oscillator) return;

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(this.volume * 0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
            
            oscillator.start(now);
            oscillator.stop(now + 0.03);
        });
    }

    playLineClear(lineCount) {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const frequencies = [262, 330, 392, 523]; // C4, E4, G4, C5
            const baseFreq = frequencies[Math.min(lineCount - 1, 3)];
            
            for (let i = 0; i < lineCount; i++) {
                setTimeout(() => {
                    const { oscillator, gainNode } = this.createOscillator(baseFreq * (1 + i * 0.2), 'sine');
                    if (!oscillator) return;

                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(this.volume * 0.5, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                }, i * 50);
            }
        });
    }

    playTetris() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const melody = [523, 659, 784, 880, 784, 659, 523]; // C5-E5-G5-A5-G5-E5-C5
            
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
                    if (!oscillator) return;

                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(this.volume * 0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.15);
                }, i * 80);
            });
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const melody = [392, 369, 349, 330, 311, 294, 277]; // Descending chromatic
            
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth');
                    if (!oscillator) return;

                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.4);
                }, i * 100);
            });
        });
    }

    playLevelUp() {
        if (!this.enabled) return;
        
        this.resumeAudioContext().then(() => {
            const melody = [261, 330, 392, 523]; // C4-E4-G4-C5
            
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    const { oscillator, gainNode } = this.createOscillator(freq, 'triangle');
                    if (!oscillator) return;

                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(this.volume * 0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                }, i * 60);
            });
        });
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}