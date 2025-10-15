// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Get references to HTML elements
const switchCanBtn = document.getElementById('switchCanBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const soundBtn = document.getElementById('soundBtn');
const litersValue = document.getElementById('litersValue');
const moneyValue = document.getElementById('moneyValue');
const fillBar = document.getElementById('fillBar');
const fillLabel = document.getElementById('fillLabel');
const timerValue = document.getElementById('timerValue');
const overflowValue = document.getElementById('overflowValue');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalLiters = document.getElementById('finalLiters');
const finalMoney = document.getElementById('finalMoney');
const playAgainBtn = document.getElementById('playAgainBtn');
const celebration = document.getElementById('celebration');
const confettiContainer = document.getElementById('confettiContainer');

// Game state variables
let totalLiters = 0;
let totalMoney = 0;
let currentFillLevel = 0;
let overflowCount = 0;
let timeRemaining = 60;
const maxCapacity = 20;
const maxOverflows = 3;
const litersPerDrop = 2;
const moneyPerLiter = 0.5;
let isPaused = false;
let isSoundOn = true;
let isGameOver = false;
let autoFillInterval = null;
let gameTimerInterval = null;

// Function to update the display
function updateDisplay() {
    // Update all the display values
    litersValue.textContent = `${totalLiters} L`;
    moneyValue.textContent = `$${totalMoney}`;
    fillLabel.textContent = `${currentFillLevel} / ${maxCapacity} L`;
    timerValue.textContent = timeRemaining; // Update timer display
    overflowValue.textContent = overflowCount;
    
    // Update progress bar width (0% to 100%)
    const fillPercentage = (currentFillLevel / maxCapacity) * 100;
    fillBar.style.width = `${fillPercentage}%`;
    
    // Change color to red if overflowing (over 100%)
    if (currentFillLevel > maxCapacity) {
        fillBar.classList.add('overflow');
    } else {
        fillBar.classList.remove('overflow');
    }
}

// Function to add water to the current jerry can
function addWater() {
    // Only add water if game is not paused and not over
    if (isPaused || isGameOver) {
        return;
    }
    
    // Add water to current jerry can
    currentFillLevel = currentFillLevel + litersPerDrop;
    updateDisplay();
    
    console.log(`Added ${litersPerDrop}L. Current fill: ${currentFillLevel}L`);
}

// Function to countdown the timer
function updateTimer() {
    // Only countdown if game is not paused and not over
    if (isPaused || isGameOver) {
        return;
    }
    
    // Decrease time by 1 second
    timeRemaining = timeRemaining - 1;
    updateDisplay();
    
    console.log(`Time remaining: ${timeRemaining} seconds`); // Debug log
    
    // Check if time is up
    if (timeRemaining <= 0) {
        endGame('time');
    }
}

// Function to create confetti pieces
function createConfetti() {
    // Create 20 confetti pieces
    for (let i = 0; i < 20; i = i + 1) {
        // Create a new confetti element
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random horizontal position for each confetti piece
        const randomX = Math.random() * 200 - 100; // Random between -100 and 100
        confetti.style.setProperty('--confetti-x', `${randomX}px`);
        
        // Random delay for staggered effect
        const randomDelay = Math.random() * 0.5; // Random delay up to 0.5 seconds
        confetti.style.animationDelay = `${randomDelay}s`;
        
        // Add confetti to container
        confettiContainer.appendChild(confetti);
    }
    
    console.log('Confetti created! 🎉');
}

// Function to show celebration animation
function showCelebration() {
    // Show the celebration
    celebration.classList.add('active');
    
    // Create confetti pieces
    createConfetti();
    
    // Hide celebration after animation completes (3 seconds)
    setTimeout(function() {
        celebration.classList.remove('active');
        // Clear confetti for next time
        confettiContainer.innerHTML = '';
    }, 3000);
    
    console.log('🎉 CELEBRATION TIME! 🍾');
}

// Function to end the game
function endGame(reason) {
    isGameOver = true;
    
    // Stop all timers
    if (autoFillInterval) {
        clearInterval(autoFillInterval);
        autoFillInterval = null;
    }
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
    
    console.log('Game ended! Reason:', reason); // Debug log
    
    // Show game over screen
    gameOverScreen.classList.add('active');
    
    // Check if player won - must complete the time AND have less than 3 overflows AND saved some water
    const didWin = (reason === 'time' && overflowCount < maxOverflows && totalLiters > 0);
    
    if (reason === 'time') {
        // Time ran out - check if they won or lost
        if (totalLiters === 0) {
            // LOSER - They saved 0 liters
            gameOverTitle.textContent = '😢 You Lost!';
            gameOverMessage.textContent = 'You saved 0 liters. Try again!';
            // NO CELEBRATION for saving 0 liters
        } else if (didWin) {
            // WINNER! They survived without 3 overflows and saved water
            gameOverTitle.textContent = '🎉 You Win! 🎉';
            gameOverMessage.textContent = `Amazing! You saved ${totalLiters} liters of water!`;
            
            // Show champagne celebration ONLY when they win
            setTimeout(function() {
                showCelebration();
            }, 500);
        } else {
            // LOSER - Time's up but they already had 3 overflows
            gameOverTitle.textContent = 'Time\'s Up!';
            gameOverMessage.textContent = 'You ran out of time!';
            // NO CELEBRATION for losing
        }
    } else if (reason === 'overflow') {
        // LOSER - They overflowed 3 times before time ran out
        gameOverTitle.textContent = 'Too Many Overflows!';
        gameOverMessage.textContent = 'You overflowed 3 times!';
        // NO CELEBRATION for losing
    }
    
    // Show final scores (whether they won or lost)
    finalLiters.textContent = `${totalLiters} L`;
    finalMoney.textContent = `$${totalMoney}`;
    
    console.log(`Final Score - Liters: ${totalLiters}L, Money: $${totalMoney}`);
    console.log(`Did Win: ${didWin}`); // This tells us if they won
}

// Switch Jerry Can button click
switchCanBtn.addEventListener('click', function() {
    if (isGameOver) {
        return;
    }
    
    console.log('Switching jerry can...');
    
    // Check if overflowed
    if (currentFillLevel > maxCapacity) {
        overflowCount = overflowCount + 1;
        console.log(`OVERFLOW! Total overflows: ${overflowCount}`);
        alert(`Oh no! The jerry can overflowed! Overflows: ${overflowCount}/${maxOverflows}`);
        
        if (overflowCount >= maxOverflows) {
            endGame('overflow');
        }
        
        currentFillLevel = 0;
    } else {
        // Success! Add to score
        const earnedLiters = currentFillLevel;
        const earnedMoney = Math.floor(earnedLiters * moneyPerLiter);
        
        totalLiters = totalLiters + earnedLiters;
        totalMoney = totalMoney + earnedMoney;
        
        console.log(`Success! Saved ${earnedLiters}L and earned $${earnedMoney}`);
        currentFillLevel = 0;
    }
    
    updateDisplay();
});

// Pause button click
pauseBtn.addEventListener('click', function() {
    if (isGameOver) {
        return;
    }
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.querySelector('.icon').textContent = '▶️';
        console.log('Game paused');
    } else {
        pauseBtn.querySelector('.icon').textContent = '⏸️';
        console.log('Game resumed');
    }
});

// Restart button click
restartBtn.addEventListener('click', function() {
    console.log('Restarting game...');
    
    // Reset all values
    totalLiters = 0;
    totalMoney = 0;
    currentFillLevel = 0;
    overflowCount = 0;
    timeRemaining = 60;
    isPaused = false;
    isGameOver = false;
    
    // Hide game over screen
    gameOverScreen.classList.remove('active');
    celebration.classList.remove('active');
    confettiContainer.innerHTML = '';
    
    // Reset pause button
    pauseBtn.querySelector('.icon').textContent = '⏸️';
    
    updateDisplay();
    
    // Restart timers
    startAutoFill();
    startGameTimer();
});

// Sound button click
soundBtn.addEventListener('click', function() {
    isSoundOn = !isSoundOn;
    
    if (isSoundOn) {
        soundBtn.querySelector('.icon').textContent = '🔊';
        console.log('Sound on');
    } else {
        soundBtn.querySelector('.icon').textContent = '🔇';
        console.log('Sound off');
    }
});

// Play Again button click
playAgainBtn.addEventListener('click', function() {
    restartBtn.click();
});

// Function to start automatic water filling
function startAutoFill() {
    // Clear any existing interval
    if (autoFillInterval) {
        clearInterval(autoFillInterval);
    }
    
    // Add water every 2 seconds
    autoFillInterval = setInterval(function() {
        addWater();
    }, 2000);
    
    console.log('Auto-fill started: adding water every 2 seconds');
}

// Function to start the game timer
function startGameTimer() {
    // Clear any existing timer
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    // Countdown every 1 second (1000 milliseconds)
    gameTimerInterval = setInterval(function() {
        updateTimer();
    }, 1000);
    
    console.log('Game timer started: 60 seconds countdown');
}

// Initialize the game when page loads
console.log('=== Charity Water Game Loaded ===');
console.log('You have 60 seconds to save as much water as possible!');
console.log('Be careful - you can only overflow 3 times!');
console.log('Water fills automatically at 2L every 2 seconds');

// Update display with starting values
updateDisplay();

// Start the game timers
startAutoFill();
startGameTimer();

console.log('Game started! Good luck! 💧');
