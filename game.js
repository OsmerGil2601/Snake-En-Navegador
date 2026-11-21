const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const startBtn = document.getElementById('startBtn');

// Configuración de la cuadrícula
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 8; // Movimientos por segundo

// Estado del juego
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let inputQueue = [];
let score = 0;
let highScore = Number(localStorage.getItem('snakeHighScore')) || 0;
let speed = INITIAL_SPEED;

let lastRenderTime = 0;
let isGameRunning = false;
let isPaused = false;
let animationFrameId = null;

highScoreEl.textContent = highScore;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  inputQueue = [];
  score = 0;
  speed = INITIAL_SPEED;
  isPaused = false;
  isGameRunning = true;

  scoreEl.textContent = score;
  overlay.classList.add('hidden');
  spawnFood();

  lastRenderTime = performance.now();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  if (!isGameRunning) return;

  animationFrameId = requestAnimationFrame(gameLoop);

  if (isPaused) return;

  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / speed) return;

  lastRenderTime = currentTime;
  update();
  draw();
}

function update() {
  if (inputQueue.length > 0) {
    direction = inputQueue.shift();
  }

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (checkCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Verificar si come
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }

    // Aumentar dificultad progresivamente
    if (score % 50 === 0) {
      speed += 1;
    }

    spawnFood();
  } else {
    snake.pop();
  }
}

function draw() {
  // Limpiar tablero
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar cuadrícula sutil
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  for (let i = 0; i < TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }

  // Dibujar comida
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(
    food.x * GRID_SIZE + 2,
    food.y * GRID_SIZE + 2,
    GRID_SIZE - 4,
    GRID_SIZE - 4,
    4
  );
  ctx.fill();

  // Dibujar serpiente
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
    ctx.beginPath();
    ctx.roundRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2,
      4
    );
    ctx.fill();
  });
}

function spawnFood() {
  let newFood;
  let onSnake;
  do {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
    onSnake = snake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
  } while (onSnake);

  food = newFood;
}

function checkCollision(head) {
  const hitWall =
    head.x < 0 ||
    head.x >= TILE_COUNT ||
    head.y < 0 ||
    head.y >= TILE_COUNT;

  const hitSelf = snake.some(
    segment => segment.x === head.x && segment.y === head.y
  );

  return hitWall || hitSelf;
}

function togglePause() {
  if (!isGameRunning) return;
  isPaused = !isPaused;

  if (isPaused) {
    overlayTitle.textContent = 'PAUSA';
    overlaySubtitle.textContent = 'Presiona Espacio para continuar.';
    startBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    startBtn.classList.remove('hidden');
    lastRenderTime = performance.now();
  }
}

function endGame() {
  isGameRunning = false;
  overlayTitle.textContent = 'GAME OVER';
  overlaySubtitle.textContent = `Puntuación final: ${score}`;
  startBtn.textContent = 'Jugar de nuevo';
  startBtn.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

function handleKeydown(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePause();
    return;
  }

  if (!isGameRunning || isPaused) return;

  // Referencia de la última dirección en cola para evitar giros de 180°
  const lastDir =
    inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;

  let nextDir = null;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (lastDir.y === 0) nextDir = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (lastDir.y === 0) nextDir = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (lastDir.x === 0) nextDir = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (lastDir.x === 0) nextDir = { x: 1, y: 0 };
      break;
  }

  if (nextDir && inputQueue.length < 2) {
    inputQueue.push(nextDir);
  }
}

document.addEventListener('keydown', handleKeydown);
startBtn.addEventListener('click', initGame);