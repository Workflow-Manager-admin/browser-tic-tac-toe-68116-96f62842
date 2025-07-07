import React, { useState, useEffect, useRef } from "react";

// PUBLIC_INTERFACE
// Minimal Snake game for React - light, modern, as per Tic Tac Toe frontend palette and style
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FF4081",
  bg: "#fff",
  gridCell: "#f4f7fb",
  snake: "#1976D2",
  snakeHead: "#FF4081",
  food: "#FF4081",
  border: "#e0e5ec"
};

const BOARD_SIZE = 15; // 15x15 grid
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
  { x: 7, y: 8 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Up

const MOVE_INTERVAL = 120; // ms

// Directions for arrow or WASD keys
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
};

// PUBLIC_INTERFACE
function SnakeGame() {
  // State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFreeCell(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // For controlling direction buffer to avoid multiple turns per tick
  const directionRef = useRef(direction);
  directionRef.current = direction;
  const moveAllowedDirection = useRef(direction);

  // For controlling game running
  const gameRunning = useRef(true);

  // Movement interval
  useEffect(() => {
    if (gameOver) return;
    gameRunning.current = true;
    const interval = setInterval(gameStep, MOVE_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [snake, direction, food, score, gameOver]);

  // Keyboard listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (gameOver) {
        if (
          e.key === " " ||
          e.key === "Enter" ||
          DIRECTIONS.hasOwnProperty(e.key)
        ) {
          restartGame();
        }
        return;
      }

      const key = e.key;
      if (Object.keys(DIRECTIONS).includes(key)) {
        const newDir = DIRECTIONS[key];
        // Don't allow to move in the opposite direction
        if (
          !isOpposite(newDir, moveAllowedDirection.current)
        ) {
          setDirection(newDir);
          moveAllowedDirection.current = newDir;
        }
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown, { passive: false });
    // eslint-disable-next-line
  }, [gameOver]);

  // PUBLIC_INTERFACE
  function restartGame() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFreeCell(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    gameRunning.current = true;
    moveAllowedDirection.current = INITIAL_DIRECTION;
  }

  // PUBLIC_INTERFACE
  function gameStep() {
    if (gameOver || !gameRunning.current) return;
    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // Hit wall or hit itself
    if (
      newHead.x < 0 ||
      newHead.x >= BOARD_SIZE ||
      newHead.y < 0 ||
      newHead.y >= BOARD_SIZE ||
      snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
    ) {
      setGameOver(true);
      gameRunning.current = false;
      return;
    }

    let newSnake;
    let newFood = food;
    let ateFood = newHead.x === food.x && newHead.y === food.y;
    if (ateFood) {
      newSnake = [newHead, ...snake];
      newFood = getRandomFreeCell([newHead, ...snake]);
      setScore(score + 1);
      setFood(newFood);
    } else {
      newSnake = [newHead, ...snake.slice(0, -1)];
    }
    setSnake(newSnake);

    // Allow new move after step is complete
    moveAllowedDirection.current = direction;
  }

  // Render grid
  const renderBoard = () => {
    const grid = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellType = null;
        if (food.x === x && food.y === y) {
          cellType = "food";
        }
        const snakeIndex = snake.findIndex(seg => seg.x === x && seg.y === y);
        if (snakeIndex !== -1) {
          cellType = snakeIndex === 0 ? "head" : "body";
        }
        grid.push(
          <div
            key={`cell-${x}-${y}`}
            className="snake-cell"
            style={{
              background:
                cellType === "head"
                  ? COLORS.snakeHead
                  : cellType === "body"
                  ? COLORS.snake
                  : cellType === "food"
                  ? COLORS.food
                  : COLORS.gridCell,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: cellType === "head" ? 6 : (cellType === "body" ? 3 : 9),
              width: "auto",
              height: "auto",
              transition: "background 0.13s",
            }}
            aria-label={
              cellType
                ? cellType.charAt(0).toUpperCase() + cellType.slice(1)
                : "Empty"
            }
          />
        );
      }
    }
    return grid;
  };

  // PUBLIC_INTERFACE
  function GameOverOverlay() {
    return (
      <div style={overlayStyles}>
        <div style={modalStyles}>
          <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.accent }}>
            Game Over
          </span>
          <div style={{ margin: "12px 0 8px", fontSize: 19, fontWeight: 600 }}>
            Score: <span style={{ color: COLORS.primary }}>{score}</span>
          </div>
          <button
            style={{ ...buttonStyles, marginTop: 20, width: "100%" }}
            onClick={restartGame}
            autoFocus
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  // Render component
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
      tabIndex={0}
      aria-label="Snake Game Main"
    >
      {/* Heading and score */}
      <div
        style={{
          marginTop: 40,
          fontSize: 25,
          fontWeight: 700,
          color: COLORS.primary,
          letterSpacing: 1.2,
        }}
      >
        Snake
      </div>
      <div
        style={{
          margin: "12px 0 0",
          fontSize: 18,
          fontWeight: 500,
          color: COLORS.secondary,
        }}
        aria-live="polite"
      >
        Score:{" "}
        <span style={{ fontWeight: 700, color: COLORS.accent }}>{score}</span>
      </div>
      {/* Game board */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1.3em)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1.3em)`,
          gap: 0,
          background: "#f4f7fb",
          borderRadius: 18,
          boxShadow: "0 2px 16px 0 rgba(25, 118, 210, 0.09)",
          width: BOARD_SIZE * 1.3 * 16,
          height: BOARD_SIZE * 1.3 * 16,
          margin: "36px 0 0 0",
          position: "relative",
          border: `3px solid ${COLORS.primary}22`,
          overflow: "hidden"
        }}
        className="snake-board"
        tabIndex={-1}
        aria-label="Snake Game Board"
        role="grid"
      >
        {renderBoard()}
      </div>
      {/* Controls */}
      <div
        style={{
          marginTop: 28,
          marginBottom: 14,
          display: "flex",
          gap: 16,
          alignItems: "center"
        }}
      >
        <button
          style={{
            ...buttonStyles,
            background: COLORS.primary,
            color: "#fff",
            minWidth: 120
          }}
          onClick={restartGame}
        >
          Restart
        </button>
        <span style={{ color: "#aaa", fontSize: 13 }}>
          Use Arrow Keys or WASD
        </span>
      </div>
      {/* Game Over Overlay if game over */}
      {gameOver ? <GameOverOverlay /> : null}
    </div>
  );
}

// Helper functions
function getRandomFreeCell(snake) {
  const positions = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (!snake.some(seg => seg.x === x && seg.y === y)) positions.push({ x, y });
    }
  }
  if (positions.length === 0) return { x: 0, y: 0 };
  return positions[Math.floor(Math.random() * positions.length)];
}

function isOpposite(dirA, dirB) {
  return dirA.x === -dirB.x && dirA.y === -dirB.y;
}

const buttonStyles = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "11px 28px",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.19,
  boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.08)",
  cursor: "pointer",
  transition: "background 0.15s, color 0.13s, transform 0.1s",
};

const overlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 100,
  width: "100vw",
  height: "100vh",
  background: "rgba(33,41,53,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "all"
};

const modalStyles = {
  background: "#fff",
  padding: "30px 34px",
  borderRadius: 16,
  boxShadow: "0 4px 24px 0 rgba(33,41,53,.14)",
  minWidth: 248,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default SnakeGame;
