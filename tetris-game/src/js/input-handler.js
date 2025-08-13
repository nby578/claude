class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyRepeatDelay = 150;
        this.keyRepeatInterval = 50;
        this.keyTimers = {};
        
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.game.restart();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.game.undo();
        });
        
        document.getElementById('mute-btn').addEventListener('click', () => {
            this.toggleMute();
        });
        
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.game.audioManager.setVolume(volume);
        });
        
        window.addEventListener('focus', () => {
            this.keys = {};
            this.clearAllTimers();
        });
    }

    handleKeyDown(e) {
        if (!this.game.gameRunning && e.code !== 'KeyR') return;
        
        const key = e.code;
        
        if (!this.keys[key]) {
            this.keys[key] = true;
            this.handleKeyPress(key);
            
            if (this.isRepeatableKey(key)) {
                this.keyTimers[key] = setTimeout(() => {
                    this.startKeyRepeat(key);
                }, this.keyRepeatDelay);
            }
        }
        
        e.preventDefault();
    }

    handleKeyUp(e) {
        const key = e.code;
        this.keys[key] = false;
        
        if (this.keyTimers[key]) {
            clearTimeout(this.keyTimers[key]);
            clearInterval(this.keyTimers[key]);
            delete this.keyTimers[key];
        }
        
        e.preventDefault();
    }

    handleKeyPress(key) {
        switch (key) {
            case 'ArrowLeft':
                this.game.moveLeft();
                break;
            case 'ArrowRight':
                this.game.moveRight();
                break;
            case 'ArrowDown':
                this.game.moveDown();
                this.game.score += 1;
                this.game.updateDisplay();
                break;
            case 'ArrowUp':
                this.game.rotate();
                break;
            case 'Space':
                this.game.hardDrop();
                break;
            case 'KeyP':
                this.game.togglePause();
                break;
            case 'KeyR':
                if (!this.game.gameRunning) {
                    this.game.restart();
                }
                break;
            case 'KeyU':
                this.game.undo();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
        }
    }

    startKeyRepeat(key) {
        this.keyTimers[key] = setInterval(() => {
            if (this.keys[key] && this.game.gameRunning && !this.game.paused) {
                this.handleKeyPress(key);
            } else {
                this.clearTimer(key);
            }
        }, this.keyRepeatInterval);
    }

    isRepeatableKey(key) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key);
    }

    clearTimer(key) {
        if (this.keyTimers[key]) {
            clearTimeout(this.keyTimers[key]);
            clearInterval(this.keyTimers[key]);
            delete this.keyTimers[key];
        }
    }

    clearAllTimers() {
        Object.keys(this.keyTimers).forEach(key => {
            this.clearTimer(key);
        });
    }
    
    toggleMute() {
        const enabled = this.game.audioManager.toggle();
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.textContent = enabled ? '🔊 Mute' : '🔇 Unmute';
    }
}