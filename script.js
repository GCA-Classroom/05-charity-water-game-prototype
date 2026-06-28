/* ============================================
   EVERY DROP COUNTS - CHARITY: WATER GAME
   JavaScript Game Logic
   ============================================ */

/* ============================================
   GAME STATE
   Track coins, purchased items, and progress
   ============================================ */
let coins = 0;  // Player's current coins
let itemsPurchased = 0;  // Number of structures built (0-4)
let dropCounter = 0;  // Unique ID for each drop (for tracking)

// Track which items have been purchased (true = purchased, false = not yet)
let purchasedItems = {
  pump: false,
  pipes: false,
  tank: false,
  station: false
};

/* ============================================
   INITIALIZE GAME
   Runs when the page loads
   ============================================ */
function initializeGame() {
  console.log('Game initialized! Catch the falling drops!');
  
  // Start spawning drops every 800ms
  spawnDrops();
  
  // Set up the purchase buttons
  initializeBuildButtons();
}

/* ============================================
   SPAWN DROPS
   Creates new falling water drops at intervals
   ============================================ */
function spawnDrops() {
  // Create a new drop every 800 milliseconds
  setInterval(() => {
    createFallingDrop();
  }, 800);
}

/* ============================================
   CREATE FALLING DROP
   Makes a single water drop that falls from top to bottom
   ============================================ */
function createFallingDrop() {
  // Get the game container where drops appear
  const gameContainer = document.getElementById('gameContainer');
  
  // Create a new div element for the drop
  const drop = document.createElement('div');
  drop.className = 'falling-drop';
  drop.textContent = '💧';
  
  // Give each drop a unique ID
  const dropId = dropCounter++;
  drop.id = `drop-${dropId}`;
  
  // Random horizontal position (left to right)
  const randomLeft = Math.random() * 90;  // 0-90% of container width
  drop.style.left = randomLeft + '%';
  
  // Add the drop to the page
  gameContainer.appendChild(drop);
  
  // Calculate fall duration (how long it takes to reach bottom)
  // Typically 3-4 seconds for good gameplay
  const fallDuration = 3500;  // milliseconds
  
  // Apply the falling animation
  drop.style.animation = `fall ${fallDuration}ms linear forwards`;
  
  // Set up click handler to catch the drop
  drop.addEventListener('click', (e) => {
    e.stopPropagation();  // Prevent event from bubbling up
    catchDrop(drop, dropId);
  });
  
  // Remove drop from the page when animation finishes (if not caught)
  setTimeout(() => {
    if (drop.parentNode) {
      drop.remove();
    }
  }, fallDuration);
}

/* ============================================
   CATCH DROP
   Called when player clicks a falling drop
   ============================================ */
function catchDrop(dropElement, dropId) {
  // Play the catch animation
  dropElement.classList.add('caught');
  
  // Add 5 coins when drop is caught
  coins = coins + 5;
  
  // Update the coin display
  updateCoinDisplay();
  
  // Remove the drop element after animation completes
  setTimeout(() => {
    if (dropElement.parentNode) {
      dropElement.remove();
    }
  }, 400);  // Match the 'caught' animation duration
}

/* ============================================
   UPDATE COIN DISPLAY
   Shows the current coin count on the page
   ============================================ */
function updateCoinDisplay() {
  // Find the element that shows coin count
  const coinCountElement = document.getElementById('coinCount');
  
  // Change its text to the current coin amount
  coinCountElement.textContent = coins;
}

/* ============================================
   INITIALIZE BUILD BUTTONS
   Set up click handlers for all purchase buttons
   ============================================ */
function initializeBuildButtons() {
  // Get all the build buttons
  const pumpBtn = document.getElementById('pumpBtn');
  const pipesBtn = document.getElementById('pipesBtn');
  const tankBtn = document.getElementById('tankBtn');
  const stationBtn = document.getElementById('stationBtn');
  
  // Add click event listeners to each button
  // When clicked, try to purchase the item
  pumpBtn.addEventListener('click', () => {
    attemptPurchase('pump', 20, '🚿');
  });
  
  pipesBtn.addEventListener('click', () => {
    attemptPurchase('pipes', 30, '🔧');
  });
  
  tankBtn.addEventListener('click', () => {
    attemptPurchase('tank', 40, '🏺');
  });
  
  stationBtn.addEventListener('click', () => {
    attemptPurchase('station', 50, '🏛️');
  });
  
  console.log('Build buttons initialized!');
}

/* ============================================
   ATTEMPT PURCHASE
   Try to buy an item - checks if player has enough coins
   ============================================ */
function attemptPurchase(itemName, itemCost, itemEmoji) {
  // Check if already purchased
  if (purchasedItems[itemName]) {
    console.log('Already purchased!');
    return;  // Exit function - can't buy twice
  }
  
  // Check if player has enough coins
  if (coins >= itemCost) {
    // Player has enough coins!
    // Deduct the cost
    coins = coins - itemCost;
    
    // Mark item as purchased
    purchasedItems[itemName] = true;
    
    // Increment the count of purchased items
    itemsPurchased = itemsPurchased + 1;
    
    // Update the coin display
    updateCoinDisplay();
    
    // Display the item in the project area
    displayProjectItem(itemName, itemEmoji);
    
    // Disable the purchase button so it can't be bought again
    disablePurchaseButton(itemName);
    
    // Update the progress bar
    updateProgressBar();
    
    // Check if player won (all 4 items purchased)
    checkForWin();
    
    console.log(`${itemName} purchased! Items built: ${itemsPurchased}/4`);
  } else {
    // Player doesn't have enough coins
    alert(`Not enough coins! Need ${itemCost}, you have ${coins}.`);
  }
}

/* ============================================
   DISABLE PURCHASE BUTTON
   Grays out button after item is purchased
   ============================================ */
function disablePurchaseButton(itemName) {
  // Map item names to button IDs
  const buttonIds = {
    'pump': 'pumpBtn',
    'pipes': 'pipesBtn',
    'tank': 'tankBtn',
    'station': 'stationBtn'
  };
  
  // Get the button element
  const button = document.getElementById(buttonIds[itemName]);
  
  // Disable it (grays out and prevents clicks)
  button.disabled = true;
}

/* ============================================
   DISPLAY PROJECT ITEM
   Shows the purchased item in the project display area
   ============================================ */
function displayProjectItem(itemName, itemEmoji) {
  // Get the project display container
  const projectDisplay = document.getElementById('projectDisplay');
  
  // Remove the "empty message" on first purchase
  const emptyMessage = projectDisplay.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  // Create a new div for this project item
  const itemElement = document.createElement('div');
  itemElement.className = 'project-item';
  itemElement.textContent = itemEmoji;
  itemElement.id = `item-${itemName}`;
  
  // Add it to the project display
  projectDisplay.appendChild(itemElement);
}

/* ============================================
   UPDATE PROGRESS BAR
   Fills the progress bar based on items purchased
   ============================================ */
function updateProgressBar() {
  // Get the progress elements
  const progressFill = document.getElementById('progressFill');
  const progressCount = document.getElementById('progressCount');
  
  // Calculate progress percentage (0-100)
  // 4 items total, so each item = 25%
  const progressPercent = (itemsPurchased / 4) * 100;
  
  // Update the progress bar width
  progressFill.style.width = progressPercent + '%';
  
  // Update the progress text (e.g., "2 / 4 Completed")
  progressCount.textContent = itemsPurchased;
}

/* ============================================
   CHECK FOR WIN
   See if player has purchased all 4 items
   ============================================ */
function checkForWin() {
  // If all 4 items have been purchased
  if (itemsPurchased === 4) {
    // Show the win screen
    showWinScreen();
  }
}

/* ============================================
   SHOW WIN SCREEN
   Display congratulations message and buttons
   ============================================ */
function showWinScreen() {
  // Get the win screen element
  const winScreen = document.getElementById('winScreen');
  
  // Show it by adding the 'active' class
  winScreen.classList.add('active');
  
  // Set up the Play Again button
  const playAgainBtn = document.getElementById('playAgainBtn');
  playAgainBtn.addEventListener('click', resetGame);
  
  console.log('🎉 Player won! All structures built!');
}

/* ============================================
   RESET GAME
   Called when player clicks "Play Again"
   ============================================ */
function resetGame() {
  // Reset all game variables
  coins = 0;
  itemsPurchased = 0;
  dropCounter = 0;
  
  purchasedItems = {
    pump: false,
    pipes: false,
    tank: false,
    station: false
  };
  
  // Hide the win screen
  const winScreen = document.getElementById('winScreen');
  winScreen.classList.remove('active');
  
  // Reset progress bar
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = '0%';
  
  const progressCount = document.getElementById('progressCount');
  progressCount.textContent = '0';
  
  // Reset coin display
  updateCoinDisplay();
  
  // Clear the project display and show empty message
  const projectDisplay = document.getElementById('projectDisplay');
  projectDisplay.innerHTML = '<p class="empty-message">Build structures to complete the project!</p>';
  
  // Re-enable all buttons
  const allButtons = document.querySelectorAll('.build-button');
  allButtons.forEach(button => {
    button.disabled = false;
  });
  
  console.log('Game reset! Ready to play again!');
}

/* ============================================
   START GAME
   Runs when the page fully loads
   ============================================ */
document.addEventListener('DOMContentLoaded', initializeGame);
