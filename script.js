const game = document.getElementById("game");
const player = document.getElementById("player");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const remainingDisplay = document.getElementById("remaining");
const message = document.getElementById("message");
const feedback = document.getElementById("feedback");
const startBtn = document.getElementById("startBtn");

const TOTAL_WATER = 8;
const START_TIME = 30;

let playerX = 50;
let playerY = 78;
let score = 0;
let timeLeft = START_TIME;
let waterCollected = 0;
let playing = false;
let bottles = [];
let timerInterval = null;
let animationFrame = null;
let keys = {};
let lastTimestamp = 0;

function randomPosition() {
  return {
    x: 7 + Math.random() * 86,
    y: 17 + Math.random() * 72
  };
}

function createBottles() {
  document.querySelectorAll(".bottle").forEach(b => b.remove());
  bottles = [];

  // Eight full water bottles and three empty bottles.
  for (let i = 0; i < TOTAL_WATER + 3; i++) {
    const full = i < TOTAL_WATER;
    const bottle = document.createElement("div");
    const pos = randomPosition();

    bottle.className = "bottle";
    bottle.textContent = full ? "💧" : "🧴";
    bottle.setAttribute(
      "aria-label",
      full ? "Full water bottle" : "Empty bottle"
    );

    bottle.style.left = pos.x + "%";
    bottle.style.top = pos.y + "%";

    game.appendChild(bottle);

    bottles.push({
      element: bottle,
      x: pos.x,
      y: pos.y,
      full,
      collected: false
    });
  }
}

function updatePlayer() {
  player.style.left = playerX + "%";
  player.style.top = playerY + "%";
}

function updateHUD() {
  timerDisplay.textContent = Math.max(0, timeLeft);
  timerDisplay.classList.toggle("danger", timeLeft <= 10);
  scoreDisplay.textContent = score;
  remainingDisplay.textContent = TOTAL_WATER - waterCollected;
}

function startGame() {
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrame);

  score = 0;
  timeLeft = START_TIME;
  waterCollected = 0;
  playerX = 50;
  playerY = 78;
  keys = {};
  playing = true;

  updatePlayer();
  updateHUD();
  createBottles();

  message.style.display = "none";
  feedback.textContent = "Go! Collect the water! 💧";

  lastTimestamp = performance.now();
  animationFrame = requestAnimationFrame(gameLoop);

  timerInterval = setInterval(() => {
    if (!playing) return;

    timeLeft--;
    updateHUD();

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHUD();
      endGame(false);
    }
  }, 1000);
}

function gameLoop(timestamp) {
  if (!playing) return;

  const delta = Math.min(
    (timestamp - lastTimestamp) / 16.67,
    2
  );
  lastTimestamp = timestamp;

  const speed = 0.65 * delta;

  if (keys.ArrowUp || keys.w) playerY -= speed;
  if (keys.ArrowDown || keys.s) playerY += speed;
  if (keys.ArrowLeft || keys.a) playerX -= speed;
  if (keys.ArrowRight || keys.d) playerX += speed;

  playerX = Math.max(3, Math.min(97, playerX));
  playerY = Math.max(9, Math.min(94, playerY));

  updatePlayer();
  checkCollisions();

  if (playing) {
    animationFrame = requestAnimationFrame(gameLoop);
  }
}

function checkCollisions() {
  for (const bottle of bottles) {
    if (bottle.collected) continue;

    const rect = game.getBoundingClientRect();
    const dx = (playerX - bottle.x) / 100 * rect.width;
    const dy = (playerY - bottle.y) / 100 * rect.height;

    if (Math.hypot(dx, dy) < 44) {
      bottle.collected = true;
      bottle.element.remove();

      if (bottle.full) {
        score++;
        waterCollected++;
        feedback.textContent = "💧 +1 point! Great job!";

        if (waterCollected === TOTAL_WATER) {
          updateHUD();
          endGame(true);
          return;
        }
      } else {
        timeLeft = Math.max(0, timeLeft - 5);
        feedback.textContent = "🧴 Empty bottle! -5 seconds!";

        if (timeLeft <= 0) {
          updateHUD();
          endGame(false);
          return;
        }
      }

      updateHUD();
    }
  }
}

function endGame(won) {
  if (!playing) return;

  playing = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrame);
  keys = {};

  message.style.display = "flex";

  if (won && timeLeft > 0) {
    message.innerHTML = `
      <h2>🎉 YOU WIN! 🎉</h2>
      <p>You collected all the water with ${timeLeft} seconds left!</p>
      <p>⭐ Final Score: ${score} / ${TOTAL_WATER}</p>
      <button id="restartBtn">Play Again</button>
    `;

    feedback.textContent = "Amazing! All the water is collected! 🥳";
    confetti();
  } else {
    message.innerHTML = `
      <h2>😵 Time's Up!</h2>
      <p>You collected ${waterCollected} out of ${TOTAL_WATER} water bottles.</p>
      <p>⭐ Final Score: ${score} / ${TOTAL_WATER}</p>
      <button id="restartBtn">Try Again</button>
    `;

    feedback.textContent = "Oh no! Try again and collect faster!";
  }

  document.getElementById("restartBtn").addEventListener(
    "click",
    startGame
  );
}

function confetti() {
  const colors = [
    "#ff4d6d",
    "#ffd166",
    "#06d6a0",
    "#4cc9f0",
    "#b388ff"
  ];

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + "s";
    piece.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    game.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

// Keyboard controls: arrow keys or WASD.
document.addEventListener("keydown", event => {
  if ([
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "
  ].includes(event.key)) {
    event.preventDefault();
  }

  if (!playing) return;

  keys[event.key] = true;

  if (event.key.length === 1) {
    keys[event.key.toLowerCase()] = true;
  }
});

document.addEventListener("keyup", event => {
  keys[event.key] = false;

  if (event.key.length === 1) {
    keys[event.key.toLowerCase()] = false;
  }
});

// Touch and mouse controls.
document.querySelectorAll("[data-dir]").forEach(button => {
  const keyMap = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight"
  };

  const key = keyMap[button.dataset.dir];

  button.addEventListener("pointerdown", event => {
    event.preventDefault();

    if (playing) keys[key] = true;

    button.setPointerCapture(event.pointerId);
  });

  function release() {
    keys[key] = false;
  }

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

// Start and reset.
startBtn.addEventListener("click", startGame);

window.addEventListener("blur", () => {
  keys = {};
});