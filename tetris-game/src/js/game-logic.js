const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.paused = false;
        
        this.fireworks = [];
        this.gameStates = [];
        this.maxUndoStates = 10;
        
        this.audioManager = new AudioManager();
        
        this.init();
    }

    init() {
        this.currentPiece = new TetrisPiece();
        this.nextPiece = new TetrisPiece();
        this.gameRunning = true;
        this.updateDisplay();
        this.drawNextPiece();
        this.saveGameState();
    }

    update(deltaTime) {
        if (!this.gameRunning || this.paused) return;

        this.dropTime += deltaTime;
        if (this.dropTime > this.dropInterval) {
            this.moveDown();
            this.dropTime = 0;
        }
        
        this.updateFireworks(deltaTime);
    }

    moveDown() {
        if (this.currentPiece.canMoveTo(
            this.currentPiece.x, 
            this.currentPiece.y + 1, 
            this.currentPiece.shape, 
            this.board
        )) {
            this.currentPiece.y++;
        } else {
            this.saveGameState();
            this.placePiece();
            this.audioManager.playPieceDrop();
            this.clearLines();
            this.spawnNewPiece();
        }
        this.draw();
    }

    moveLeft() {
        if (this.currentPiece.canMoveTo(
            this.currentPiece.x - 1, 
            this.currentPiece.y, 
            this.currentPiece.shape, 
            this.board
        )) {
            this.currentPiece.x--;
            this.audioManager.playPieceMove();
            this.draw();
        }
    }

    moveRight() {
        if (this.currentPiece.canMoveTo(
            this.currentPiece.x + 1, 
            this.currentPiece.y, 
            this.currentPiece.shape, 
            this.board
        )) {
            this.currentPiece.x++;
            this.audioManager.playPieceMove();
            this.draw();
        }
    }

    rotate() {
        const rotatedShape = this.currentPiece.rotate();
        if (this.currentPiece.canMoveTo(
            this.currentPiece.x, 
            this.currentPiece.y, 
            rotatedShape, 
            this.board
        )) {
            this.currentPiece.shape = rotatedShape;
            this.audioManager.playPieceRotate();
            this.draw();
        }
    }

    hardDrop() {
        this.saveGameState();
        while (this.currentPiece.canMoveTo(
            this.currentPiece.x, 
            this.currentPiece.y + 1, 
            this.currentPiece.shape, 
            this.board
        )) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.placePiece();
        this.audioManager.playPieceDrop();
        this.clearLines();
        this.spawnNewPiece();
        this.updateDisplay();
        this.draw();
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        let clearedRows = [];
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                clearedRows.push(y);
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            const oldLevel = this.level;
            this.score += [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateDisplay();
            
            if (linesCleared === 4) {
                this.audioManager.playTetris();
            } else {
                this.audioManager.playLineClear(linesCleared);
            }
            
            if (this.level > oldLevel) {
                this.audioManager.playLevelUp();
            }
            
            this.createFireworks(clearedRows);
        }
    }

    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = new TetrisPiece();
        this.drawNextPiece();

        if (!this.currentPiece.canMoveTo(
            this.currentPiece.x, 
            this.currentPiece.y, 
            this.currentPiece.shape, 
            this.board
        )) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameRunning = false;
        this.audioManager.playGameOver();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }

    restart() {
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.paused = false;
        
        document.getElementById('game-over').classList.add('hidden');
        this.init();
        this.draw();
    }

    togglePause() {
        this.paused = !this.paused;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoard();
        this.drawGhost();
        this.drawCurrentPiece();
        this.drawFireworks();
    }

    drawBoard() {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            }
        }
    }

    drawGhost() {
        if (!this.currentPiece) return;
        
        const ghostY = this.currentPiece.getGhostPosition(this.board);
        this.ctx.globalAlpha = 0.3;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.ctx.fillStyle = this.currentPiece.color;
                    this.ctx.fillRect(
                        (this.currentPiece.x + x) * BLOCK_SIZE,
                        (ghostY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        this.ctx.fillStyle = this.currentPiece.color;
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.ctx.fillRect(
                        (this.currentPiece.x + x) * BLOCK_SIZE,
                        (this.currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = this.nextPiece.color;
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    createFireworks(clearedRows) {
        clearedRows.forEach(row => {
            const rowY = row * BLOCK_SIZE + BLOCK_SIZE / 2;
            
            // Explosion particles from center
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 * i) / 20;
                const speed = 3 + Math.random() * 4;
                this.fireworks.push({
                    x: BOARD_WIDTH * BLOCK_SIZE / 2,
                    y: rowY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 2000 + Math.random() * 1000,
                    maxLife: 2000 + Math.random() * 1000,
                    size: 2 + Math.random() * 3,
                    type: 'explosion',
                    color: `hsl(${Math.random() * 60 + 10}, 100%, ${50 + Math.random() * 30}%)`,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                });
            }
            
            // Confetti pieces across the row
            for (let i = 0; i < 25; i++) {
                this.fireworks.push({
                    x: Math.random() * BOARD_WIDTH * BLOCK_SIZE,
                    y: rowY + (Math.random() - 0.5) * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -2 - Math.random() * 4,
                    life: 3000 + Math.random() * 2000,
                    maxLife: 3000 + Math.random() * 2000,
                    size: 3 + Math.random() * 4,
                    type: 'confetti',
                    color: `hsl(${Math.random() * 360}, 85%, 60%)`,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3
                });
            }
            
            // Sparkles that rise up
            for (let i = 0; i < 15; i++) {
                this.fireworks.push({
                    x: Math.random() * BOARD_WIDTH * BLOCK_SIZE,
                    y: rowY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3 - Math.random() * 3,
                    life: 1500 + Math.random() * 1000,
                    maxLife: 1500 + Math.random() * 1000,
                    size: 1 + Math.random() * 2,
                    type: 'sparkle',
                    color: `hsl(${Math.random() * 60 + 40}, 100%, 80%)`,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        });
    }

    updateFireworks(deltaTime) {
        this.fireworks = this.fireworks.filter(particle => {
            // Update position (simplified)
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply different physics based on type
            if (particle.type === 'explosion') {
                particle.vy += 0.15; // Light gravity
                particle.vx *= 0.98; // Air resistance
                particle.vy *= 0.98;
                particle.rotation += particle.rotationSpeed;
            } else if (particle.type === 'confetti') {
                particle.vy += 0.25; // More gravity
                particle.vx *= 0.985; // Air resistance
                particle.rotation += particle.rotationSpeed;
                // Add flutter effect
                particle.vx += Math.sin(particle.life / 100) * 0.1;
            } else if (particle.type === 'sparkle') {
                particle.vy += 0.1; // Very light gravity
                particle.vx *= 0.99;
                particle.twinkle += 0.3;
            }
            
            // Boundary bouncing for confetti
            if (particle.type === 'confetti') {
                if (particle.x < 0 || particle.x > BOARD_WIDTH * BLOCK_SIZE) {
                    particle.vx *= -0.7;
                    particle.x = Math.max(0, Math.min(BOARD_WIDTH * BLOCK_SIZE, particle.x));
                }
            }
            
            particle.life -= deltaTime;
            return particle.life > 0 && particle.y < (BOARD_HEIGHT + 5) * BLOCK_SIZE;
        });
    }

    drawFireworks() {
        this.fireworks.forEach(particle => {
            const alpha = Math.min(1, particle.life / particle.maxLife);
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'explosion') {
                // Draw explosion particles as simple circles with rotation effect
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                const size = particle.size;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add simple cross effect
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(-size * 1.5, 0);
                this.ctx.lineTo(size * 1.5, 0);
                this.ctx.moveTo(0, -size * 1.5);
                this.ctx.lineTo(0, size * 1.5);
                this.ctx.stroke();
                
            } else if (particle.type === 'confetti') {
                // Draw confetti as simple rotating rectangles
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                const width = particle.size;
                const height = particle.size * 1.5;
                this.ctx.fillRect(-width/2, -height/2, width, height);
                
            } else if (particle.type === 'sparkle') {
                // Draw sparkles as simple twinkling circles
                const twinkleAlpha = alpha * (0.5 + 0.5 * Math.sin(particle.twinkle));
                this.ctx.globalAlpha = twinkleAlpha;
                this.ctx.translate(particle.x, particle.y);
                const size = particle.size;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }

    saveGameState() {
        const state = {
            board: this.board.map(row => [...row]),
            currentPiece: this.currentPiece ? {
                x: this.currentPiece.x,
                y: this.currentPiece.y,
                shape: this.currentPiece.shape.map(row => [...row]),
                color: this.currentPiece.color,
                type: this.currentPiece.type
            } : null,
            nextPiece: this.nextPiece ? {
                x: this.nextPiece.x,
                y: this.nextPiece.y,
                shape: this.nextPiece.shape.map(row => [...row]),
                color: this.nextPiece.color,
                type: this.nextPiece.type
            } : null,
            score: this.score,
            level: this.level,
            lines: this.lines,
            dropTime: this.dropTime,
            dropInterval: this.dropInterval
        };
        
        this.gameStates.push(state);
        if (this.gameStates.length > this.maxUndoStates) {
            this.gameStates.shift();
        }
    }

    undo() {
        if (this.gameStates.length === 0) return false;
        
        const state = this.gameStates.pop();
        this.board = state.board;
        
        if (state.currentPiece) {
            this.currentPiece = new TetrisPiece(state.currentPiece.type);
            this.currentPiece.x = state.currentPiece.x;
            this.currentPiece.y = state.currentPiece.y;
            this.currentPiece.shape = state.currentPiece.shape;
        } else {
            this.currentPiece = null;
        }
        
        if (state.nextPiece) {
            this.nextPiece = new TetrisPiece(state.nextPiece.type);
            this.nextPiece.x = state.nextPiece.x;
            this.nextPiece.y = state.nextPiece.y;
            this.nextPiece.shape = state.nextPiece.shape;
        } else {
            this.nextPiece = null;
        }
        
        this.score = state.score;
        this.level = state.level;
        this.lines = state.lines;
        this.dropTime = state.dropTime;
        this.dropInterval = state.dropInterval;
        
        this.updateDisplay();
        this.drawNextPiece();
        this.draw();
        
        return true;
    }
}