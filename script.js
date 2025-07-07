// Charity: Water Snake Game
// This code makes the jerry can act like the snake in Snake, collecting water droplets.

// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

const gridSize = 10; // 10x10 grid
const gameArea = document.getElementById('game-area');

// Snake (jerry can) starts with length 1
let snake = [{ x: 5, y: 5 }]; // Start in the middle of 10x10
let direction = { x: 1, y: 0 }; // Start moving right
let nextDirection = { x: 1, y: 0 }; // Buffer for direction changes
let water; // Will be set in resetGameState()
let score = 0;
let gameInterval = null;
let gameOver = false;
let corruptedWaters = [];
let corruptedCollected = 0;

// Update score and corrupted marker selectors for sidebar
const scoreDisplay = document.getElementById('score');
const corruptedMarker = document.getElementById('corrupted-marker');

// Create the grid and draw everything
function createGrid() {
    gameArea.innerHTML = '';
    gameArea.style.display = 'grid';
    gameArea.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    gameArea.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            // Draw water droplet only if water exists
            if (water && row === water.y && col === water.x) {
                cell.classList.add('water');
                cell.innerText = '💧';
            }
            // Draw corrupted water droplet
            const corrupted = corruptedWaters.find(cw => cw.x === col && cw.y === row);
            if (corrupted) {
                cell.classList.add('corrupted-water');
                cell.innerText = '🦠';
            }
            // Draw snake (jerry can)
            const snakePart = snake.find(part => part.x === col && part.y === row);
            if (snakePart) {
                cell.classList.add('jerrycan');
                // Use the charity: water jerry can logo image
                const img = document.createElement('img');
                img.src = 'img/water-can.png';
                img.alt = 'Jerry Can';
                img.style.width = '80%';
                img.style.height = '80%';
                cell.appendChild(img);
            }
            gameArea.appendChild(cell);
        }
    }
}

// Move the snake
function moveSnake() {
    if (gameOver) return;
    direction = { ...nextDirection };
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    // If the snake runs into a wall, show a custom message
    if (
        newHead.x < 0 || newHead.x >= gridSize ||
        newHead.y < 0 || newHead.y >= gridSize
    ) {
        gameOver = true;
        clearInterval(gameInterval);
        document.getElementById('message').textContent = 'Game Over! You spilled the water.';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        return;
    }
    // If the snake runs into itself, show the same message
    if (snake.some(part => part.x === newHead.x && part.y === newHead.y)) {
        gameOver = true;
        clearInterval(gameInterval);
        document.getElementById('message').textContent = 'Game Over! You spilled the water.';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        return;
    }
    snake.unshift(newHead);
    // Check for corrupted water collection
    const corruptedIdx = corruptedWaters.findIndex(cw => cw.x === newHead.x && cw.y === newHead.y);
    if (corruptedIdx !== -1) {
        corruptedWaters.splice(corruptedIdx, 1);
        corruptedCollected++;
        // Reduce score by 3, but not below 0
        score = Math.max(0, score - 3);
        updateScore();
        updateCorruptedMarker();
        if (corruptedCollected >= 5) {
            gameOver = true;
            clearInterval(gameInterval);
            document.getElementById('message').textContent = 'Game Over! You collected 5 corrupted water droplets.';
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            return;
        }
    }
    // Check for water collection
    if (water && newHead.x === water.x && newHead.y === water.y) {
        score++;
        updateScore();
        // End the game if 50 water droplets are collected
        if (score >= 50) {
            gameOver = true;
            clearInterval(gameInterval);
            document.getElementById('message').textContent = 'Congratulations, you have collected 50 water droplets!';
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            // Winning effect: fill the game area with water droplets
            fillGameAreaWithWater();
            return;
        }
        // Try to spawn a new water droplet
        water = spawnWater();
        // If no more water can be spawned, end the game (player wins)
        if (!water) {
            gameOver = true;
            clearInterval(gameInterval);
            document.getElementById('message').textContent = 'Congratulations! You filled the grid!';
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            return;
        }
        // Spawn a corrupted droplet every 3 water droplets
        if (score % 3 === 0) {
            spawnCorruptedWater();
        }
        // Every 10 water droplets, add a new part to the snake (grow by 1 extra)
        if (score % 10 === 0) {
            // Do not remove the tail, so the snake grows by 1
            // (No pop here means the snake grows by 2 for this move)
        } else {
            // Remove tail if no extra growth
            snake.pop();
        }
    } else {
        // Remove tail if no water collected
        snake.pop();
    }
    createGrid();
}

function updateCorruptedMarker() {
    corruptedMarker.textContent = corruptedCollected;
}

// Spawn water at a random empty cell
function spawnWater() {
    let emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Make sure water does not spawn on snake or corrupted water
            if (
                !snake.some(part => part.x === col && part.y === row) &&
                !corruptedWaters.some(cw => cw.x === col && cw.y === row)
            ) {
                emptyCells.push({ x: col, y: row });
            }
        }
    }
    // If there are no empty cells, return null
    if (emptyCells.length === 0) {
        return null;
    }
    // Pick a random empty cell for the water droplet
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Helper to spawn a corrupted water droplet
function spawnCorruptedWater() {
    // No limit on the number of corrupted droplets
    let emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Make sure corrupted water does not spawn on snake or water
            if (
                !snake.some(part => part.x === col && part.y === row) &&
                !(water && water.x === col && water.y === row) &&
                !corruptedWaters.some(cw => cw.x === col && cw.y === row)
            ) {
                emptyCells.push({ x: col, y: row });
            }
        }
    }
    if (emptyCells.length > 0) {
        corruptedWaters.push(emptyCells[Math.floor(Math.random() * emptyCells.length)]);
    }
}

// Update the score display
function updateScore() {
    scoreDisplay.textContent = score;
}

// End the game
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
}

// Get buttons from the HTML
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

let paused = false;

// Set initial button visibility
startBtn.style.display = 'inline-block';
stopBtn.style.display = 'none';
resetBtn.style.display = 'inline-block';

// Start button: starts or resumes the game
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
    paused = false;
    if (gameOver || !gameInterval) {
        startGame();
    } else {
        // Resume game
        gameInterval = setInterval(moveSnake, 150);
    }
});

// Stop button: pauses the game
stopBtn.addEventListener('click', () => {
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    paused = true;
    clearInterval(gameInterval);
});

// Reset button: resets the game and waits for Start
resetBtn.addEventListener('click', () => {
    clearInterval(gameInterval);
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    paused = false;
    corruptedWaters = [];
    corruptedCollected = 0;
    updateCorruptedMarker();
    document.getElementById('message').textContent = '';
    resetGameState();
    // Wait for user to press Start again
});

// Reset game state to initial values
function resetGameState() {
    snake = [{ x: 5, y: 5 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    water = spawnWater(); // Always spawn water after resetting snake
    score = 0;
    gameOver = false;
    updateScore();
    createGrid();
}

// Start or restart the game
function startGame() {
    clearInterval(gameInterval); // Stop any previous game loop
    gameOver = false;
    paused = false;
    corruptedWaters = [];
    corruptedCollected = 0;
    updateCorruptedMarker();
    // Always reset snake and score when starting
    resetGameState();
    // Start the game loop
    gameInterval = setInterval(moveSnake, 150);
    document.getElementById('message').textContent = '';
}

// Listen for WASD keys (no reverse direction)
window.addEventListener('keydown', (e) => {
    if ((e.key === 'w' || e.key === 'W') && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    if ((e.key === 'a' || e.key === 'A') && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    if ((e.key === 's' || e.key === 'S') && direction.y !== -1) nextDirection = { x: 0, y: 1 };
    if ((e.key === 'd' || e.key === 'D') && direction.x !== -1) nextDirection = { x: 1, y: 0 };
});

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;
gameArea.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});
gameArea.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && direction.x !== -1) nextDirection = { x: 1, y: 0 }; // Right
        if (dx < -20 && direction.x !== 1) nextDirection = { x: -1, y: 0 }; // Left
    } else {
        if (dy > 20 && direction.y !== -1) nextDirection = { x: 0, y: 1 }; // Down
        if (dy < -20 && direction.y !== 1) nextDirection = { x: 0, y: -1 }; // Up
    }
});

// Add some simple CSS for the grid (for beginners, you can move this to styles.css)
const style = document.createElement('style');
style.textContent = `
  #game-area {
    width: 600px;
    height: 600px;
    margin: 0 auto;
    background: #e0e0e0;
    border: 2px solid #aaa;
  }
  .grid-cell {
    border: 1px solid #ccc;
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: #f9f9f9;
  }
  .jerrycan {
    background: #ffe066;
    font-size: 24px;
    font-weight: bold;
  }
  .water {
    background: #b3e6ff;
  }
  .corrupted-water {
    background: #ffb3b3;
  }
`;
document.head.appendChild(style);

// Fills the game area with water droplets for a winning effect
function fillGameAreaWithWater() {
    // Loop through all grid cells and set them to water
    gameArea.innerHTML = '';
    gameArea.style.display = 'grid';
    gameArea.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    gameArea.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell', 'water');
            cell.innerText = '💧';
            gameArea.appendChild(cell);
        }
    }
}
