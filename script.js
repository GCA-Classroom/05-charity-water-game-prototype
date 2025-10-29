const gameArea = document.getElementById("gameArea");
const bucket = document.getElementById("bucket");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const startButton = document.getElementById("startButton");
const scoreFill = document.getElementById("scoreFill");
const difficultySelect = document.getElementById("difficulty");

let score = 0;
let lives = 3;
let gameInterval;
let isGameRunning = false;
let difficulty = "normal";
let spawnRate = 800;
let goal = 100;

// ✅ Difficulty settings
function setDifficulty(level) {
  difficulty = level;
  if (level === "easy") {
    spawnRate = 1000;
    goal = 50;
  } else if (level === "normal") {
    spawnRate = 800;
    goal = 100;
  } else if (level === "hard") {
    spawnRate = 500;
    goal = 150;
  }
}
difficultySelect.addEventListener("change", (e) => setDifficulty(e.target.value));

function createRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  const isBlue = Math.random() < 0.7;
  drop.classList.add(isBlue ? "blue" : "grey");
  drop.style.left = Math.random() * 370 + "px";
  gameArea.appendChild(drop);

  let fallSpeed = 2 + Math.random() * 3;
  let topPosition = 0;

  // 💧 Click to interact
  drop.addEventListener("click", () => {
    if (!isGameRunning) return;
    if (drop.classList.contains("blue")) {
      score += 10;
    } else {
      lives -= 1;
    }
    updateHUD();
    drop.remove();
  });

  const fall = setInterval(() => {
    topPosition += fallSpeed;
    drop.style.top = topPosition + "px";

    const dropRect = drop.getBoundingClientRect();
    const bucketRect = bucket.getBoundingClientRect();

    // Collision detection
    if (
      dropRect.bottom >= bucketRect.top &&
      dropRect.left < bucketRect.right &&
      dropRect.right > bucketRect.left
    ) {
      if (drop.classList.contains("blue")) {
        score += 5;
      } else {
        lives -= 1;
      }
      updateHUD();
      drop.remove();
      clearInterval(fall);
    }

    if (topPosition > 500) {
      drop.remove();
      clearInterval(fall);
    }

    // 🏆 Win condition
    if (score >= goal) {
      clearInterval(fall);
      clearInterval(gameInterval);
      isGameRunning = false;
      alert(`🎉 You reached ${goal} points on ${difficulty} mode!`);
    }

    // ❌ Game over
    if (lives <= 0) {
      clearInterval(fall);
      clearInterval(gameInterval);
      isGameRunning = false;
      alert("💧 Game Over! Your final score: " + score);
    }
  }, 20);
}

function updateHUD() {
  scoreDisplay.textContent = `Score: ${score}`;
  livesDisplay.textContent = `Lives: ${lives}`;
  updateScoreBar();
}

function updateScoreBar() {
  const percent = Math.min((score / goal) * 100, 100);
  scoreFill.style.width = percent + "%";
}

// 🎮 Start Game
startButton.addEventListener("click", () => {
  if (isGameRunning) return;
  isGameRunning = true;
  score = 0;
  lives = 3;
  updateHUD();
  scoreFill.style.width = "0%";

  document.querySelectorAll(".raindrop").forEach((d) => d.remove());
  clearInterval(gameInterval);
  gameInterval = setInterval(createRaindrop, spawnRate);
});

// 🧺 Move bucket
document.addEventListener("keydown", (event) => {
  const bucketLeft = parseInt(window.getComputedStyle(bucket).left);
  const step = gameArea.offsetWidth * 0.05;

  if (!isGameRunning) return;

  if (event.key === "ArrowLeft" && bucketLeft > 0) {
    bucket.style.left = bucketLeft - step + "px";
  }
  if (event.key === "ArrowRight" && bucketLeft < 350) {
    bucket.style.left = bucketLeft + step + "px";
  }
});



