// Water Collector Game

const gameBoard = document.getElementById("gameBoard");
const levelDisplay = document.getElementById("levelDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const movesDisplay = document.getElementById("movesDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const celebration = document.getElementById("celebration");

// Image path for final yellow jerry can
const JERRY_CAN_PATH = "img/water_can_yellow.png";

// Game state
let level = 1;
let score = 0;
let moves = 0;
let lives = 3;
let timeLeft = 30;
let timer = null;
let gameActive = false;
let changingLevel = false;

let rows = 5;
let cols = 5;

let playerPosition = { row: 0, col: 0 };
let bucketPosition = { row: 4, col: 4 };

let blockedCells = [];
let filledCells = [];

// Create a new level
function createLevel() {
  rows = 5;
  cols = 5;

  timeLeft = Math.max(18, 34 - level * 2);

  playerPosition = {
    row: 0,
    col: 0
  };

  bucketPosition = {
    row: rows - 1,
    col: cols - 1
  };

  blockedCells = [];
  filledCells = [];

  filledCells.push(positionKey(playerPosition.row, playerPosition.col));

  generateRandomBlocks();

  updateDisplay();
  drawBoard();

  message.textContent =
    "Every move helps deliver clean water. Fill every square, then reach the yellow jerry can!";
}

// Random obstacle generation that only accepts solvable levels
function generateRandomBlocks() {
  const numberOfBlocks = Math.min(2 + level, 6);
  let attempts = 0;
  let validLevelFound = false;

  while (!validLevelFound && attempts < 500) {
    blockedCells = [];

    while (blockedCells.length < numberOfBlocks) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);

      const key = positionKey(randomRow, randomCol);

      const isStart =
        randomRow === playerPosition.row &&
        randomCol === playerPosition.col;

      const isBucket =
        randomRow === bucketPosition.row &&
        randomCol === bucketPosition.col;

      if (!isStart && !isBucket && !blockedCells.includes(key)) {
        blockedCells.push(key);
      }
    }

    if (canSolveLevel()) {
      validLevelFound = true;
    }

    attempts++;
  }

  if (!validLevelFound) {
    blockedCells = [positionKey(2, 2)];
  }
}

// Checks whether the current sliding level is possible to complete
function canSolveLevel() {
  const requiredSquares = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = positionKey(row, col);

      if (!blockedCells.includes(key) && !isBucket(row, col)) {
        requiredSquares.push(key);
      }
    }
  }

  const requiredTotal = requiredSquares.length;
  const startKey = positionKey(playerPosition.row, playerPosition.col);

  const startState = {
    row: playerPosition.row,
    col: playerPosition.col,
    filled: [startKey]
  };

  const queue = [startState];
  const visitedStates = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    const stateKey =
      current.row +
      "-" +
      current.col +
      "-" +
      current.filled.slice().sort().join(",");

    if (visitedStates.has(stateKey)) {
      continue;
    }

    visitedStates.add(stateKey);

    const allFilled = current.filled.length >= requiredTotal;
    const atBucket = isBucket(current.row, current.col);

    if (allFilled && atBucket) {
      return true;
    }

    const directions = ["up", "down", "left", "right"];

    directions.forEach(function(direction) {
      const nextState = simulateSlide(
        current.row,
        current.col,
        direction,
        current.filled
      );

      if (nextState.moved) {
        queue.push({
          row: nextState.row,
          col: nextState.col,
          filled: nextState.filled
        });
      }
    });
  }

  return false;
}

// Simulates one sliding move without changing the real game board
function simulateSlide(startRow, startCol, direction, currentFilled) {
  let newRow = startRow;
  let newCol = startCol;
  let moved = false;
  let newFilled = [...currentFilled];

  while (true) {
    let nextRow = newRow;
    let nextCol = newCol;

    if (direction === "up") nextRow--;
    if (direction === "down") nextRow++;
    if (direction === "left") nextCol--;
    if (direction === "right") nextCol++;

    const nextKey = positionKey(nextRow, nextCol);

    const insideGrid =
      nextRow >= 0 &&
      nextRow < rows &&
      nextCol >= 0 &&
      nextCol < cols;

    const blocked = blockedCells.includes(nextKey);

    if (!insideGrid || blocked) {
      break;
    }

    newRow = nextRow;
    newCol = nextCol;
    moved = true;

    const newKey = positionKey(newRow, newCol);

    if (!newFilled.includes(newKey) && !isBucket(newRow, newCol)) {
      newFilled.push(newKey);
    }
  }

  return {
    row: newRow,
    col: newCol,
    moved: moved,
    filled: newFilled
  };
}

// Draw board
function drawBoard() {
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      const key = positionKey(row, col);

      cell.classList.add("cell");

      if (filledCells.includes(key)) {
        cell.classList.add("filled");
      }

      if (blockedCells.includes(key)) {
        cell.classList.add("blocked");
        cell.textContent = "✕";
      }

      if (row === bucketPosition.row && col === bucketPosition.col) {
        cell.classList.add("bucket");
        cell.innerHTML = `
          <img src="${JERRY_CAN_PATH}" alt="Yellow jerry can finish square" class="bucket-icon">
        `;
      }

      if (row === playerPosition.row && col === playerPosition.col) {
        cell.classList.add("player");

        if (row === bucketPosition.row && col === bucketPosition.col) {
          cell.innerHTML = `
            <img src="${JERRY_CAN_PATH}" alt="Yellow jerry can finish square" class="bucket-icon">
            <span class="player-token">💧</span>
          `;
        } else {
          cell.textContent = "💧";
        }
      }

      gameBoard.appendChild(cell);
    }
  }
}

// Start game
function startGame() {
  if (gameActive || changingLevel) {
    return;
  }

  clearInterval(timer);

  gameActive = true;
  message.textContent = "Game started! Move the water drop.";

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      loseLife();
    }
  }, 1000);
}

// Move player - slides until hitting a barrier
function movePlayer(direction) {
  if (!gameActive) {
    message.textContent = "Press Start Game first!";
    return;
  }

  if (changingLevel) {
    return;
  }

  let newRow = playerPosition.row;
  let newCol = playerPosition.col;
  let canMove = false;
  let cellsFilled = 0;

  while (true) {
    let nextRow = newRow;
    let nextCol = newCol;

    if (direction === "up") nextRow--;
    if (direction === "down") nextRow++;
    if (direction === "left") nextCol--;
    if (direction === "right") nextCol++;

    if (!isValidMove(nextRow, nextCol)) {
      break;
    }

    newRow = nextRow;
    newCol = nextCol;
    canMove = true;

    const key = positionKey(newRow, newCol);

    if (!filledCells.includes(key) && !isBucket(newRow, newCol)) {
      filledCells.push(key);
      score += 5;
      cellsFilled++;
    }
  }

  if (!canMove) {
    message.textContent = "You can't move in that direction!";
    return;
  }

  playerPosition.row = newRow;
  playerPosition.col = newCol;
  moves++;

  if (cellsFilled > 0) {
    message.textContent = `Water moved across the community! +${cellsFilled * 5} points`;
  } else {
    message.textContent = "Keep going! Fill every square before finishing.";
  }

  checkBucket();
  updateDisplay();
  drawBoard();
}

// Check if move is legal
function isValidMove(row, col) {
  const key = positionKey(row, col);

  const insideGrid = row >= 0 && row < rows && col >= 0 && col < cols;
  const isBlocked = blockedCells.includes(key);

  return insideGrid && !isBlocked;
}

// Check if player reached final jerry can
function checkBucket() {
  if (!isBucket(playerPosition.row, playerPosition.col)) {
    return;
  }

  if (allSquaresFilled()) {
    winLevel();
  } else {
    message.textContent =
      "Fill all squares before reaching the yellow jerry can!";
  }
}

// Check all open squares are filled
function allSquaresFilled() {
  let totalOpenSquares = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = positionKey(row, col);

      if (!blockedCells.includes(key) && !isBucket(row, col)) {
        totalOpenSquares++;
      }
    }
  }

  return filledCells.length >= totalOpenSquares;
}

// Win level
function winLevel() {
  gameActive = false;
  changingLevel = true;
  clearInterval(timer);

  const timeBonus = timeLeft * 10;
  const movePenalty = moves * 2;
  const levelBonus = 100;

  score += Math.max(levelBonus + timeBonus - movePenalty, 25);

  message.textContent =
    "Level Complete! You helped deliver clean water with fewer wasted moves!";

  updateDisplay();
  drawBoard();
  showCelebration();

  setTimeout(() => {
    level++;
    moves = 0;
    gameActive = false;
    changingLevel = false;
    createLevel();
    message.textContent = "New level created! Press Start Game to begin.";
  }, 1800);
}

// Lose life
function loseLife() {
  gameActive = false;
  clearInterval(timer);

  lives--;

  if (lives > 0) {
    message.textContent = `Time's up! You lost a life. Lives left: ${lives}`;
    updateDisplay();

    setTimeout(() => {
      resetCurrentLevel();
    }, 1200);
  } else {
    message.textContent = "Game over! You ran out of lives.";
    updateDisplay();

    setTimeout(() => {
      fullReset();
    }, 1500);
  }
}

// Reset current level after losing life
function resetCurrentLevel() {
  moves = 0;
  gameActive = false;
  changingLevel = false;
  createLevel();
  message.textContent = "Life lost. Try this route again!";
}

// Full reset after losing all lives
function fullReset() {
  level = 1;
  score = 0;
  moves = 0;
  lives = 3;
  gameActive = false;
  changingLevel = false;
  createLevel();
  message.textContent = "Game restarted. Press Start Game to play again.";
}

// Manual reset
function resetGame() {
  clearInterval(timer);

  level = 1;
  score = 0;
  moves = 0;
  lives = 3;
  gameActive = false;
  changingLevel = false;

  celebration.classList.add("hidden");

  createLevel();
  message.textContent = "Game reset. Press Start Game to play again.";
}

// Celebration animation
function showCelebration() {
  celebration.classList.remove("hidden");

  setTimeout(() => {
    celebration.classList.add("hidden");
  }, 1600);
}

// Helpers
function positionKey(row, col) {
  return `${row}-${col}`;
}

function isBucket(row, col) {
  return row === bucketPosition.row && col === bucketPosition.col;
}

function updateDisplay() {
  levelDisplay.textContent = level;
  timerDisplay.textContent = timeLeft;
  movesDisplay.textContent = moves;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = "💧".repeat(lives);
}

// Keyboard controls
document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    movePlayer("up");
  }

  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    movePlayer("down");
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    movePlayer("left");
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    movePlayer("right");
  }
});

// Button controls
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

upBtn.addEventListener("click", () => movePlayer("up"));
downBtn.addEventListener("click", () => movePlayer("down"));
leftBtn.addEventListener("click", () => movePlayer("left"));
rightBtn.addEventListener("click", () => movePlayer("right"));

// Load first level
createLevel();