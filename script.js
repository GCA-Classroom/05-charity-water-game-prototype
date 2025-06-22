// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const dropletsCountSpan = document.getElementById('dropletsCount');
    const gameTimerDisplay = document.getElementById('gameTimer');
    const endGameLink = document.getElementById('endGameLink');
    const glass = document.querySelector('.glass-container'); // Get the glass container element
    const achievementLogos = document.getElementById('achievementLogos'); // Get the achievement logos container

    let dropletsCollected = 0; // Initial count based on wireframe
    let timeInSeconds = 90; // 1 minute 25 seconds
    let gameInterval;
    let dropletGenerationInterval;

    // Glass movement variables
    let glassPosition = 50; // Starting position as percentage (50% = center)
    const glassSpeed = 2; // Speed for keyboard movement
    const glassWidth = 80; // Glass width in pixels (matches CSS)

    // Function to update the displayed droplet count
    function updateDropletsDisplay() {
        dropletsCountSpan.textContent = dropletsCollected;
        
        // Calculate how many logos should be displayed (one for every 10 droplets)
        const expectedLogos = Math.floor(dropletsCollected / 10);
        const currentLogos = achievementLogos.children.length;
        
        // Add logos if we need more
        if (expectedLogos > currentLogos) {
            for (let i = currentLogos; i < expectedLogos; i++) {
                const logoItem = document.createElement('div');
                logoItem.classList.add('achievement-logo-item');
                
                const logoImg = document.createElement('img');
                logoImg.src = 'img/cw_logo.png';
                logoImg.alt = 'CW Logo Achievement';
                logoImg.classList.add('cw-achievement-logo');
                
                const logoText = document.createElement('span');
                logoText.classList.add('achievement-text');
                logoText.textContent = `${(i + 1) * 10}`;
                
                logoItem.appendChild(logoImg);
                logoItem.appendChild(logoText);
                achievementLogos.appendChild(logoItem);
                
                console.log(`Achievement unlocked: ${(i + 1) * 10} droplets collected!`);
            }
        }
        // Remove logos if count decreased (due to dark droplets)
        else if (expectedLogos < currentLogos) {
            for (let i = currentLogos - 1; i >= expectedLogos; i--) {
                achievementLogos.removeChild(achievementLogos.children[i]);
            }
        }
    }

    // Function to check if droplet collides with glass
    function checkCollision(droplet) {
        const dropletRect = droplet.getBoundingClientRect();
        const glassRect = glass.getBoundingClientRect();
        
        // Check if droplet overlaps with glass
        const collision = !(dropletRect.right < glassRect.left || 
                           dropletRect.left > glassRect.right || 
                           dropletRect.bottom < glassRect.top || 
                           dropletRect.top > glassRect.bottom);
        
        return collision;
    }

    // Function to create a new droplet
    function createDroplet() {
        const droplet = document.createElement('div');
        droplet.classList.add('droplet');
        // Randomly assign light or dark color
        if (Math.random() > 0.5) {
            droplet.classList.add('dark');
            // For every dark droplet, create a blue droplet too
            setTimeout(() => createBlueDroplet(), Math.random() * 1000); // Create blue droplet within 1 second
        }

        // Position droplet at random horizontal position at the top
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;

        // Random horizontal position, but always start at the top
        const minLeft = 10; // Small padding from the left
        const maxLeft = gameAreaWidth - 40; // gameAreaWidth - dropletWidth - padding
        
        droplet.style.left = `${Math.random() * (maxLeft - minLeft) + minLeft}px`;
        droplet.style.top = '-30px'; // Start above the container
        
        // Set random fall duration (3-6 seconds)
        const fallDuration = Math.random() * 3 + 3; // 3 to 6 seconds
        droplet.style.animationDuration = `${fallDuration}s`;

        // Check for collision with glass during fall (for both blue and dark droplets)
        let collisionInterval = setInterval(() => {
            if (checkCollision(droplet)) {
                // Droplet hit the glass!
                clearInterval(collisionInterval);
                droplet.remove();
                
                if (droplet.classList.contains('dark')) {
                    // Dark droplet decreases count
                    dropletsCollected--;
                    if (dropletsCollected < 0) dropletsCollected = 0; // Don't go below zero
                    updateDropletsDisplay();
                    console.log('Dark droplet hit glass - count decreased!');
                } else {
                    // Blue droplet increases count
                    dropletsCollected++;
                    updateDropletsDisplay();
                    console.log('Blue droplet caught by glass!');
                }
            }
        }, 50); // Check collision every 50ms

        // Remove droplet when clicked (but don't increase counter)
        // droplet.addEventListener('click', () => {
        //     if (collisionInterval) clearInterval(collisionInterval);
        //     droplet.remove(); // Remove droplet when clicked, but no points
        // });

        // Remove droplet when it reaches the bottom
        droplet.addEventListener('animationend', () => {
            if (collisionInterval) clearInterval(collisionInterval);
            if (droplet.parentNode) {
                droplet.remove();
            }
        });

        gameArea.appendChild(droplet);
    }

    // Function to create a guaranteed blue droplet
    function createBlueDroplet() {
        const droplet = document.createElement('div');
        droplet.classList.add('droplet');
        // This droplet is guaranteed to be blue (no dark class added)

        // Position droplet at random horizontal position at the top
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;

        // Random horizontal position, but always start at the top
        const minLeft = 10; // Small padding from the left
        const maxLeft = gameAreaWidth - 40; // gameAreaWidth - dropletWidth - padding
        
        droplet.style.left = `${Math.random() * (maxLeft - minLeft) + minLeft}px`;
        droplet.style.top = '-30px'; // Start above the container
        
        // Set random fall duration (3-6 seconds)
        const fallDuration = Math.random() * 3 + 3; // 3 to 6 seconds
        droplet.style.animationDuration = `${fallDuration}s`;

        // Check for collision with glass during fall
        let collisionInterval = setInterval(() => {
            if (checkCollision(droplet)) {
                // Blue droplet hit the glass!
                clearInterval(collisionInterval);
                droplet.remove();
                
                // Blue droplet increases count
                dropletsCollected++;
                updateDropletsDisplay();
                console.log('Blue droplet caught by glass!');
            }
        }, 50); // Check collision every 50ms

        // Remove droplet when it reaches the bottom
        droplet.addEventListener('animationend', () => {
            if (collisionInterval) clearInterval(collisionInterval);
            if (droplet.parentNode) {
                droplet.remove();
            }
        });

        gameArea.appendChild(droplet);
    }

    // Function to end the game and save results
    function endGame() {
        clearInterval(gameInterval);
        clearInterval(dropletGenerationInterval);
        
        // Save game results to pass to end game page
        const waterCans = Math.floor(dropletsCollected / 10); // 1 water can per 10 droplets
        localStorage.setItem('gameResults', JSON.stringify({
            waterCans: waterCans,
            droplets: dropletsCollected,
            totalTime: 90, // Original time limit
            timeUsed: 90 - timeInSeconds
        }));
        
        // Navigate to end game page
        window.location.href = 'endGame.html';
    }

    // Game timer logic
    function startGameTimer() {
        gameInterval = setInterval(() => {
            timeInSeconds--;
            if (timeInSeconds < 0) {
                timeInSeconds = 0; // Prevent negative time
            }
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            gameTimerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeInSeconds <= 0) {
                endGame(); // Use the new endGame function
            }
        }, 1000); // Update every second
    }

    // Function to update glass position
    function updateGlassPosition() {
        // Ensure glass stays within game area bounds
        const gameAreaWidth = gameArea.offsetWidth;
        const minPosition = (glassWidth / 2) / gameAreaWidth * 100; // Left boundary
        const maxPosition = 100 - (glassWidth / 2) / gameAreaWidth * 100; // Right boundary
        
        // Keep glass within bounds
        if (glassPosition < minPosition) glassPosition = minPosition;
        if (glassPosition > maxPosition) glassPosition = maxPosition;
        
        // Apply the position
        glass.style.left = `${glassPosition}%`;
        glass.style.transform = 'translateX(-50%)'; // Keep centered on position
    }

    // Mouse movement control
    gameArea.addEventListener('mousemove', (event) => {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const mouseX = event.clientX - gameAreaRect.left; // Mouse position relative to game area
        glassPosition = (mouseX / gameAreaRect.width) * 100; // Convert to percentage
        updateGlassPosition();
    });

    // Keyboard movement control
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault(); // Prevent page scrolling
                glassPosition -= glassSpeed;
                updateGlassPosition();
                break;
            case 'ArrowRight':
                event.preventDefault(); // Prevent page scrolling
                glassPosition += glassSpeed;
                updateGlassPosition();
                break;
        }
    });

    // Initial setup
    updateDropletsDisplay(); // Display initial droplets count
    startGameTimer(); // Start the timer
    updateGlassPosition(); // Initialize glass position

    // Generate initial droplets and then continuously
    for (let i = 0; i < 5; i++) { // Generate a few droplets at the start
        createDroplet();
    }

    // Periodically generate new droplets
    dropletGenerationInterval = setInterval(() => {
        createDroplet();
    }, 1500); // Generate a new droplet every 1.5 seconds
});
