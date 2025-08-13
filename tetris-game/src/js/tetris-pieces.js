const TETRIS_PIECES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00ff00'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff0000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000ff'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff7f00'
    }
};

class TetrisPiece {
    constructor(type = null) {
        const pieceTypes = Object.keys(TETRIS_PIECES);
        this.type = type || pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        this.shape = TETRIS_PIECES[this.type].shape.map(row => [...row]);
        this.color = TETRIS_PIECES[this.type].color;
        this.x = Math.floor((BOARD_WIDTH - this.shape[0].length) / 2);
        this.y = 0;
    }

    rotate() {
        const rotated = this.shape[0].map((_, index) =>
            this.shape.map(row => row[index]).reverse()
        );
        return rotated;
    }

    getGhostPosition(board) {
        let ghostY = this.y;
        while (this.canMoveTo(this.x, ghostY + 1, this.shape, board)) {
            ghostY++;
        }
        return ghostY;
    }

    canMoveTo(newX, newY, shape, board) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= BOARD_WIDTH || 
                        boardY >= BOARD_HEIGHT || 
                        (boardY >= 0 && board[boardY][boardX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}