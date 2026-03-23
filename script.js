const scoreEl = document.getElementById("score");
const goalEl = document.getElementById("goal");
const timerEl = document.getElementById("timer");
const feedbackEl = document.getElementById("feedback");
const milestoneTextEl = document.getElementById("milestoneText");
const progressFillEl = document.getElementById("progressFill");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficultySelect");
const playAgainBtn = document.getElementById("playAgainBtn");
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");
const confettiContainer = document.getElementById("confettiContainer");
const ruleCanEl = document.getElementById("ruleCan");
const rulePipeEl = document.getElementById("rulePipe");
const ruleGoalEl = document.getElementById("ruleGoal");
const cells = document.querySelectorAll(".cell");

const difficultySettings = {
  easy: {
    label: "Easy",
    winScore: 80,
    startTime: 40,
    spawnRate: 1000,
    canPoints: 12,
    pipePenalty: 3,
    pipeChance: 0.2,
    milestones: [
      { score: 20, message: "Great start!" },
      { score: 40, message: "Halfway there!" },
      { score: 70, message: "Almost there!" },
    ],
  },
  normal: {
    label: "Normal",
    winScore: 100,
    startTime: 30,
    spawnRate: 800,
    canPoints: 10,
    pipePenalty: 5,
    pipeChance: 0.25,
    milestones: [
      { score: 25, message: "Great start!" },
      { score: 50, message: "Halfway there!" },
      { score: 85, message: "Almost there!" },
    ],
  },
  hard: {
    label: "Hard",
    winScore: 120,
    startTime: 24,
    spawnRate: 650,
    canPoints: 8,
    pipePenalty: 8,
    pipeChance: 0.35,
    milestones: [
      { score: 30, message: "Nice pace!" },
      { score: 60, message: "Halfway there!" },
      { score: 100, message: "Last push!" },
    ],
  },
};

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let timerInterval = null;
let spawnInterval = null;
let activeIndex = null;
let activeType = null;
let currentDifficulty = "normal";
let reachedMilestones = [];

function getMode() {
  return difficultySettings[currentDifficulty];
}

function updateRuleText() {
  const mode = getMode();
  ruleCanEl.textContent = `Tap yellow cans = +${mode.canPoints} points`;
  rulePipeEl.textContent = `Tap broken pipes = -${mode.pipePenalty} points`;
  ruleGoalEl.textContent = `Reach ${mode.winScore}+ points before ${mode.startTime} seconds runs out`;
}

function updateUI() {
  const mode = getMode();

  scoreEl.textContent = score;
  goalEl.textContent = mode.winScore;
  timerEl.textContent = timeLeft;

  const progress = Math.min((score / mode.winScore) * 100, 100);
  progressFillEl.style.width = `${progress}%`;
}

function clearBoard() {
  cells.forEach((cell) => {
    cell.className = "cell";
    cell.textContent = "";
  });
  activeIndex = null;
  activeType = null;
}

function showFeedback(message) {
  feedbackEl.textContent = message;
}

function showMilestone(message) {
  milestoneTextEl.textContent = message;
  milestoneTextEl.classList.remove("hidden");
}

function checkMilestones() {
  const mode = getMode();

  mode.milestones.forEach((milestone, index) => {
    if (score >= milestone.score && !reachedMilestones.includes(index)) {
      reachedMilestones.push(index);
      showMilestone(`Milestone: ${milestone.message}`);
      showFeedback(`Milestone reached! ${milestone.message}`);
    }
  });
}

function removeActiveItem(cell) {
  // This function used to clear just one cell.
  // To avoid duplicating logic, we now call clearBoard(),
  // which already knows how to reset the board before spawning a new item.
  clearBoard();
}

function spawnItem() {
  clearBoard();
  const mode = getMode();

  const index = Math.floor(Math.random() * cells.length);
  const type = Math.random() < 1 - mode.pipeChance ? "can" : "pipe";

  activeIndex = index;
  activeType = type;

  const cell = cells[index];
  if (type === "can") {
    cell.classList.add("can");
    cell.textContent = "🟨";
  } else {
    cell.classList.add("pipe");
    cell.textContent = "🚫";
  }
}

function startGame() {
  resetGameState();
  gameRunning = true;
  endScreen.classList.add("hidden");
  showFeedback(`${getMode().label} mode started!`);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateUI();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  spawnItem();
  spawnInterval = setInterval(spawnItem, getMode().spawnRate);
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  clearBoard();

  const mode = getMode();

  const won = score >= mode.winScore;
  endTitle.textContent = won ? "You Win!" : "Game Over";
  endMessage.textContent = `You collected ${score} liters in ${mode.label} mode.`;
  endScreen.classList.remove("hidden");

  showFeedback(won ? "Nice job! You won." : "Time is up.");

  if (won) {
    launchConfetti();
  }
}

function resetGameState() {
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  score = 0;
  timeLeft = getMode().startTime;
  reachedMilestones = [];
  clearBoard();
  updateUI();
  milestoneTextEl.classList.add("hidden");
  showFeedback("Press Start to play");
}

function resetGame() {
  gameRunning = false;
  endScreen.classList.add("hidden");
  resetGameState();
}

function launchConfetti() {
  confettiContainer.innerHTML = "";

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti");
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3500);
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!gameRunning || index !== activeIndex) return;

    const mode = getMode();

    if (activeType === "can") {
      score += mode.canPoints;
      cell.classList.add("hit-good");
      showFeedback(`+${mode.canPoints} points! Clean water collected.`);
      checkMilestones();
    } else if (activeType === "pipe") {
      score = Math.max(0, score - mode.pipePenalty);
      cell.classList.add("hit-bad");
      showFeedback(`-${mode.pipePenalty} points! Avoid broken pipes.`);
    }

    activeIndex = null;
    activeType = null;
    removeActiveItem(cell);
    updateUI();
  });
});

difficultySelect.addEventListener("change", () => {
  currentDifficulty = difficultySelect.value;
  updateRuleText();
  resetGame();
  showFeedback(`${getMode().label} mode selected. Press Start to play.`);
});

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", startGame);

updateRuleText();
updateUI();
