# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a classic Tetris game built with vanilla HTML5, CSS3, and JavaScript using Canvas API. The game features standard Tetris mechanics including piece rotation, line clearing, scoring, levels, and a next piece preview.

## Development Commands

- **Start development server**: `npm run dev` - Launches live-server on port 3000 with auto-reload
- **Start simple server**: `npm start` - Launches http-server on port 3000 and opens browser
- **Lint code**: `npm run lint` - Runs ESLint on JavaScript files in src/js/
- **Format code**: `npm run format` - Formats code using Prettier
- **Run tests**: `npm test` - Runs Jest tests (test files should be added to src/js/ with .test.js extension)
- **Build check**: `npm run build` - Confirms no build step needed for vanilla JS

## Architecture

### Core Components

**TetrisPiece Class** (`src/js/tetris-pieces.js`)
- Defines all 7 Tetris piece types (I, O, T, S, Z, J, L) with shapes and colors
- Handles piece rotation, collision detection, and ghost piece positioning
- Each piece spawns at the top-center of the game board

**TetrisGame Class** (`src/js/game-logic.js`)
- Main game engine managing board state, scoring, and game loop
- Handles piece movement, line clearing, level progression
- Manages two Canvas contexts: main game board and next piece preview
- Game board is 10x20 blocks, each block is 30px square

**InputHandler Class** (`src/js/input-handler.js`)
- Manages keyboard input with key repeat functionality
- Arrow keys for movement/rotation, Space for hard drop, P for pause
- Handles game restart and prevents input when game is over

**Main Game Loop** (`src/js/main.js`)
- Initializes game and starts the requestAnimationFrame loop
- Manages timing and coordinates between all systems

### File Structure
```
tetris-game/
├── index.html              # Main game interface
├── package.json            # Dependencies and scripts
├── src/
│   ├── css/
│   │   └── style.css       # Game styling with responsive design
│   └── js/
│       ├── tetris-pieces.js # Piece definitions and logic
│       ├── game-logic.js    # Core game mechanics
│       ├── input-handler.js # Keyboard input management
│       └── main.js          # Game initialization and loop
└── CLAUDE.md               # This file
```

## Key Constants

- `BOARD_WIDTH`: 10 blocks
- `BOARD_HEIGHT`: 20 blocks  
- `BLOCK_SIZE`: 30 pixels
- Game speed increases every 10 lines cleared
- Scoring: 100/300/500/800 points for 1/2/3/4 lines cleared (multiplied by level)

## Game Features

- **Standard Tetris mechanics**: 7-piece rotation system, line clearing, soft/hard drop
- **Ghost piece**: Semi-transparent preview of piece landing position
- **Next piece preview**: Shows upcoming piece in dedicated canvas
- **Progressive difficulty**: Speed increases with level (every 10 lines)
- **Responsive design**: Adapts to mobile screens
- **Pause functionality**: P key to pause/resume
- **Game over screen**: Shows final score with restart button

## Development Notes

- Uses vanilla JavaScript ES6+ classes - no framework dependencies
- Canvas rendering for smooth animations and precise control
- Modular architecture allows easy extension (new piece types, power-ups, etc.)
- Input handling includes key repeat for smooth movement
- Game state is completely contained in TetrisGame class for easy testing