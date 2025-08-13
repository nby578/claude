let game;
let inputHandler;
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    game.update(deltaTime);
    
    requestAnimationFrame(gameLoop);
}

function init() {
    game = new TetrisGame();
    inputHandler = new InputHandler(game);
    
    game.draw();
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);