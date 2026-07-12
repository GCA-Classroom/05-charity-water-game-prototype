/* ============================================
   EVERY DROP COUNTS - CHARITY: WATER GAME
   JavaScript Game Logic
   ============================================ */

/* ============================================
   GAME STATE
   Track coins, purchased items, and progress
   ============================================ */
let coins = 0;
let itemsPurchased = 0;
let dropCounter = 0;
let dropTimerId = null;
let difficulty = 'normal';
let milestoneMessagesShown = [];

const milestoneMessages = [
  { threshold: 10, message: 'Halfway there!' },
  { threshold: 20, message: 'You are building momentum!' },
  { threshold: 30, message: 'Amazing teamwork!' },
  { threshold: 40, message: 'You are changing lives!' }
];

// Track which items have been purchased (true = purchased, false = not yet)
let purchasedItems = {
  pump: false,
  pipes: false,
  tank: false,
  station: false
};

const difficultySettings = {
  easy: {
    label: 'Easy',
    requiredItems: 2,
    spawnInterval: 1100,
    fallDuration: 4200,
    obstacleRate: 0.1
  },
  normal: {
    label: 'Normal',
    requiredItems: 3,
    spawnInterval: 800,
    fallDuration: 3500,
    obstacleRate: 0.2
  },
  hard: {
    label: 'Hard',
    requiredItems: 4,
    spawnInterval: 600,
    fallDuration: 2800,
    obstacleRate: 0.35
  }
};

/* ============================================
   INITIALIZE GAME
   Runs when the page loads
   ============================================ */
function initializeGame() {
  console.log('Game initialized! Catch the falling drops!');

  initializeDifficultyButtons();
  initializeBuildButtons();

  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', resetGame);

  const playAgainBtn = document.getElementById('playAgainBtn');
  playAgainBtn.addEventListener('click', resetGame);

  resetGame();
}

function getDifficultySettings() {
  return difficultySettings[difficulty];
}

function initializeDifficultyButtons() {
  const difficultyButtons = document.querySelectorAll('.difficulty-button');

  difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      difficulty = button.dataset.difficulty;
      updateDifficultyUI();
      resetGame();
    });
  });
}

function updateDifficultyUI() {
  const currentSettings = getDifficultySettings();
  const statusElement = document.getElementById('difficultyStatus');
  const instructionElement = document.getElementById('catchInstruction');

  document.querySelectorAll('.difficulty-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.difficulty === difficulty);
  });

  statusElement.textContent = `${currentSettings.label} mode · Goal: ${currentSettings.requiredItems} structures`;

  if (difficulty === 'easy') {
    instructionElement.textContent = 'Easy mode: build 2 structures with slower drops and fewer gray obstacles.';
  } else if (difficulty === 'hard') {
    instructionElement.textContent = 'Hard mode: build 4 structures while faster drops and more gray obstacles test your focus.';
  } else {
    instructionElement.textContent = 'Normal mode: build 3 structures as the drops keep moving.';
  }
}

/* ============================================
   START DROP SPAWNER
   Creates new falling water drops at intervals
   ============================================ */
function startDropSpawner() {
  if (dropTimerId) {
    clearInterval(dropTimerId);
  }

  const settings = getDifficultySettings();
  dropTimerId = setInterval(() => {
    createFallingDrop();
  }, settings.spawnInterval);
}

/* ============================================
   CREATE FALLING DROP
   Makes a single water drop that falls from top to bottom
   ============================================ */
function createFallingDrop() {
  const gameContainer = document.getElementById('gameContainer');
  const settings = getDifficultySettings();

  const drop = document.createElement('div');
  const isObstacle = Math.random() < settings.obstacleRate;
  drop.className = isObstacle ? 'falling-drop obstacle-drop' : 'falling-drop';
  drop.textContent = '💧';

  const dropId = dropCounter++;
  drop.id = `drop-${dropId}`;

  const randomLeft = Math.random() * 90;
  drop.style.left = randomLeft + '%';
  drop.style.top = '-50px';

  gameContainer.appendChild(drop);

  const fallDuration = settings.fallDuration;
  drop.style.animation = `fall ${fallDuration}ms linear forwards`;

  drop.addEventListener('click', (e) => {
    e.stopPropagation();
    handleDropClick(drop, isObstacle);
  });

  setTimeout(() => {
    if (drop.parentNode) {
      drop.remove();
    }
  }, fallDuration);
}

/* ============================================
   HANDLE DROP CLICK
   Adds coins for good drops and removes coins for gray obstacle drops
   ============================================ */
function handleDropClick(dropElement, isObstacle) {
  dropElement.classList.add('caught');

  if (isObstacle) {
    coins = Math.max(0, coins - 10);
  } else {
    coins = coins + 5;
  }

  showInteractionFeedback(dropElement, isObstacle);
  updateCoinDisplay();
  checkMilestones();

  setTimeout(() => {
    if (dropElement.parentNode) {
      dropElement.remove();
    }
  }, 400);
}

function showInteractionFeedback(dropElement, isObstacle) {
  const feedbackLayer = document.getElementById('feedbackLayer');
  const feedback = document.createElement('div');
  feedback.className = isObstacle ? 'feedback-message obstacle-feedback' : 'feedback-message';
  feedback.textContent = isObstacle ? '-10 💰' : '+5 💰';
  feedback.style.left = dropElement.style.left;
  feedback.style.top = '20px';

  feedbackLayer.appendChild(feedback);

  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 800);
}

/* ============================================
   UPDATE COIN DISPLAY
   Shows the current coin count on the page
   ============================================ */
function updateCoinDisplay() {
  const coinCountElement = document.getElementById('coinCount');
  coinCountElement.textContent = coins;
}

function showMilestoneMessage(message) {
  const milestoneMessage = document.getElementById('milestoneMessage');
  milestoneMessage.textContent = message;
  milestoneMessage.classList.add('active');

  setTimeout(() => {
    milestoneMessage.classList.remove('active');
    milestoneMessage.textContent = '';
  }, 1800);
}

function checkMilestones() {
  milestoneMessages.forEach((milestone) => {
    if (coins >= milestone.threshold && !milestoneMessagesShown.includes(milestone.threshold)) {
      milestoneMessagesShown.push(milestone.threshold);
      showMilestoneMessage(milestone.message);
    }
  });
}

/* ============================================
   INITIALIZE BUILD BUTTONS
   Set up click handlers for all purchase buttons
   ============================================ */
function initializeBuildButtons() {
  const pumpBtn = document.getElementById('pumpBtn');
  const pipesBtn = document.getElementById('pipesBtn');
  const tankBtn = document.getElementById('tankBtn');
  const stationBtn = document.getElementById('stationBtn');

  pumpBtn.addEventListener('click', () => {
    attemptPurchase('pump', 20, '🚿');
  });

  pipesBtn.addEventListener('click', () => {
    attemptPurchase('pipes', 25, '🔧');
  });

  tankBtn.addEventListener('click', () => {
    attemptPurchase('tank', 30, '🏺');
  });

  stationBtn.addEventListener('click', () => {
    attemptPurchase('station', 35, '🏛️');
  });

  console.log('Build buttons initialized!');
}

/* ============================================
   ATTEMPT PURCHASE
   Try to buy an item - checks if player has enough coins
   ============================================ */
function attemptPurchase(itemName, itemCost, itemEmoji) {
  if (purchasedItems[itemName]) {
    console.log('Already purchased!');
    return;
  }

  if (coins >= itemCost) {
    coins = coins - itemCost;
    purchasedItems[itemName] = true;
    itemsPurchased = itemsPurchased + 1;

    updateCoinDisplay();
    checkMilestones();
    displayProjectItem(itemName, itemEmoji);
    disablePurchaseButton(itemName);
    updateProgressBar();
    checkForWin();

    console.log(`${itemName} purchased! Items built: ${itemsPurchased}/${getDifficultySettings().requiredItems}`);
  } else {
    alert(`Not enough coins! Need ${itemCost}, you have ${coins}.`);
  }
}

/* ============================================
   DISABLE PURCHASE BUTTON
   Grays out button after item is purchased
   ============================================ */
function disablePurchaseButton(itemName) {
  const buttonIds = {
    pump: 'pumpBtn',
    pipes: 'pipesBtn',
    tank: 'tankBtn',
    station: 'stationBtn'
  };

  const button = document.getElementById(buttonIds[itemName]);
  button.disabled = true;
}

/* ============================================
   DISPLAY PROJECT ITEM
   Shows the purchased item in the project display area
   ============================================ */
function displayProjectItem(itemName, itemEmoji) {
  const projectDisplay = document.getElementById('projectDisplay');

  const emptyMessage = projectDisplay.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const itemElement = document.createElement('div');
  itemElement.className = 'project-item';
  itemElement.textContent = itemEmoji;
  itemElement.id = `item-${itemName}`;

  projectDisplay.appendChild(itemElement);
}

/* ============================================
   UPDATE PROGRESS BAR
   Fills the progress bar based on items purchased
   ============================================ */
function updateProgressBar() {
  const progressFill = document.getElementById('progressFill');
  const progressCount = document.getElementById('progressCount');
  const targetCount = getDifficultySettings().requiredItems;
  const progressPercent = (itemsPurchased / targetCount) * 100;

  progressFill.style.width = progressPercent + '%';
  progressCount.textContent = `${itemsPurchased}/${targetCount}`;
}

/* ============================================
   CHECK FOR WIN
   See if player has reached the goal for the current difficulty
   ============================================ */
function checkForWin() {
  if (itemsPurchased >= getDifficultySettings().requiredItems) {
    showWinScreen();
  }
}

/* ============================================
   SHOW WIN SCREEN
   Display congratulations message and buttons
   ============================================ */
function showWinScreen() {
  const winScreen = document.getElementById('winScreen');
  const winMessage = document.querySelector('.win-message');

  winScreen.classList.add('active');
  winMessage.textContent = `You reached the ${getDifficultySettings().label.toLowerCase()} goal and helped fund a clean water project!`;

  createConfetti();

  console.log(`🎉 Player won on ${difficulty} difficulty!`);
}

/* ============================================
   CREATE CONFETTI
   Adds a burst of colorful pieces to celebrate a win
   ============================================ */
function createConfetti() {
  const confettiLayer = document.getElementById('confettiLayer');
  confettiLayer.innerHTML = '';

  const colors = ['#FFC907', '#77A8BB', '#FED8C1', '#003366', '#FFFFFF'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.2 + 's';
    piece.style.setProperty('--x-end', (Math.random() * 200 - 100) + 'px');
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);
  }
}

/* ============================================
   RESET GAME
   Called when player clicks Reset or Play Again
   ============================================ */
function resetGame() {
  coins = 0;
  itemsPurchased = 0;
  dropCounter = 0;
  milestoneMessagesShown = [];

  purchasedItems = {
    pump: false,
    pipes: false,
    tank: false,
    station: false
  };

  const winScreen = document.getElementById('winScreen');
  winScreen.classList.remove('active');

  const confettiLayer = document.getElementById('confettiLayer');
  confettiLayer.innerHTML = '';

  const feedbackLayer = document.getElementById('feedbackLayer');
  feedbackLayer.innerHTML = '';

  const milestoneMessage = document.getElementById('milestoneMessage');
  milestoneMessage.textContent = '';
  milestoneMessage.classList.remove('active');

  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = '0%';

  const progressCount = document.getElementById('progressCount');
  progressCount.textContent = `0/${getDifficultySettings().requiredItems}`;

  updateCoinDisplay();
  updateDifficultyUI();

  const projectDisplay = document.getElementById('projectDisplay');
  projectDisplay.innerHTML = '<p class="empty-message">Build structures to complete the project!</p>';

  const allButtons = document.querySelectorAll('.build-button');
  allButtons.forEach((button) => {
    button.disabled = false;
  });

  startDropSpawner();

  console.log('Game reset! Ready to play again!');
}

/* ============================================
   START GAME
   Runs when the page fully loads
   ============================================ */
document.addEventListener('DOMContentLoaded', initializeGame);
