import React, { useState, useEffect } from "react";
import "./App.css";

// Color variables, can be used inline or in CSS
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FF4081",
};

const EMPTY_BOARD = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

// PUBLIC_INTERFACE
function App() {
  // State for the board
  const [board, setBoard] = useState(EMPTY_BOARD);
  // State to track current player: 'X' or 'O'
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // State for winner ('X' or 'O'), or 'draw', or null (playing)
  const [gameResult, setGameResult] = useState(null);

  // Reset the game
  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(EMPTY_BOARD);
    setCurrentPlayer("X");
    setGameResult(null);
  };

  // Handle cell click
  // PUBLIC_INTERFACE
  const handleCellClick = (row, col) => {
    if (board[row][col] !== "" || gameResult) {
      return;
    }
    // Update board immutably
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? currentPlayer : cell))
    );
    setBoard(newBoard);

    // Only update player if game is not over
    // We'll check game result AFTER updating board (in useEffect below)
  };

  // Check for win or draw on board change
  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      setGameResult(winner);
    } else if (board.flat().every((cell) => cell !== "")) {
      setGameResult("draw");
    } else if (board !== EMPTY_BOARD) {
      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
    }
    // eslint-disable-next-line
  }, [board]);

  // Utility to check winner
  // PUBLIC_INTERFACE
  function checkWinner(board) {
    // Rows, columns, diagonals
    const lines = [
      // rows
      [board[0][0], board[0][1], board[0][2]],
      [board[1][0], board[1][1], board[1][2]],
      [board[2][0], board[2][1], board[2][2]],
      // columns
      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],
      // diagonals
      [board[0][0], board[1][1], board[2][2]],
      [board[0][2], board[1][1], board[2][0]],
    ];
    for (const line of lines) {
      if (line[0] && line[0] === line[1] && line[1] === line[2]) {
        return line[0]; // 'X' or 'O'
      }
    }
    return null;
  }

  // Minimalistic overlay for game end
  // PUBLIC_INTERFACE
  function GameEndOverlay({ result, onRestart }) {
    let text;
    if (result === "draw") text = "It's a draw!";
    else text = `Player ${result} wins!`;
    return (
      <div style={overlayStyles}>
        <div style={modalStyles}>
          <span style={{ fontSize: 28, fontWeight: 700 }}>{text}</span>
          <button
            style={{ ...buttonStyles, marginTop: 24, width: "100%" }}
            onClick={onRestart}
            autoFocus
          >
            Restart Game
          </button>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Player Indicator */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 16,
          fontSize: 22,
          letterSpacing: 1,
          fontWeight: 600,
        }}
      >
        {gameResult
          ? "Game Over"
          : (
            <>
              Current Player:&nbsp;
              <span
                style={{
                  color:
                    currentPlayer === "X" ? COLORS.primary : COLORS.accent,
                  transition: "color 0.2s",
                }}
                aria-live="polite"
              >
                {currentPlayer}
              </span>
            </>
          )}
      </div>

      {/* Board */}
      <div
        className="ttt-board"
        style={{
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          background: "#f4f7fb",
          borderRadius: 24,
          boxShadow: "0 2px 16px 0 rgba(25, 118, 210, 0.10)",
          width: 345,
          height: 345,
          margin: "0 auto",
          position: "relative",
        }}
        aria-label="Tic Tac Toe Board"
        role="grid"
        tabIndex={0}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isLastCol = colIndex === 2;
            const isLastRow = rowIndex === 2;
            return (
              <button
                key={`cell-${rowIndex}-${colIndex}`}
                className="ttt-cell"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  background: "#fff",
                  color:
                    cell === "X"
                      ? COLORS.primary
                      : cell === "O"
                        ? COLORS.accent
                        : COLORS.secondary,
                  fontSize: 56,
                  fontWeight: 700,
                  cursor:
                    cell === "" && !gameResult ? "pointer" : "default",
                  borderTop:
                    rowIndex > 0
                      ? `2px solid ${COLORS.secondary}33`
                      : "none",
                  borderLeft:
                    colIndex > 0
                      ? `2px solid ${COLORS.secondary}33`
                      : "none",
                  borderRight: isLastCol
                    ? "none"
                    : undefined,
                  borderBottom: isLastRow
                    ? "none"
                    : undefined,
                  transition: "color 0.1s, box-shadow 0.1s",
                  borderRadius:
                    // round corners only at board corners
                    rowIndex === 0 && colIndex === 0
                      ? "22px 0 0 0"
                      : rowIndex === 0 && colIndex === 2
                        ? "0 22px 0 0"
                        : rowIndex === 2 && colIndex === 0
                          ? "0 0 0 22px"
                          : rowIndex === 2 && colIndex === 2
                            ? "0 0 22px 0"
                            : 0,
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={Boolean(cell) || Boolean(gameResult)}
                aria-label={
                  cell
                    ? `Cell ${rowIndex + 1}, ${colIndex + 1}: ${cell}`
                    : `Cell ${rowIndex + 1}, ${colIndex + 1}, empty`
                }
                role="gridcell"
              >
                {cell}
              </button>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "row",
          gap: 16,
        }}
      >
        <button
          style={{
            ...buttonStyles,
            background: COLORS.primary,
            color: "#fff",
            minWidth: 120,
          }}
          onClick={restartGame}
        >
          Restart
        </button>
      </div>

      {/* Game End Overlay */}
      {gameResult ? (
        <GameEndOverlay result={gameResult} onRestart={restartGame} />
      ) : null}

      {/* Attribution */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 13,
          color: "#bbb",
          letterSpacing: 0.1,
          fontWeight: 400,
          opacity: 0.6,
          userSelect: "none",
        }}
      >
        Minimal Tic Tac Toe – React
      </div>
    </div>
  );
}

// Inline button and overlay styles (minimalistic, modern)
const buttonStyles = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 28px",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.2,
  boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.08)",
  cursor: "pointer",
  transition: "background 0.18s, color 0.14s, transform 0.1s",
};
const overlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 100,
  width: "100vw",
  height: "100vh",
  background: "rgba(33,41,53,0.13)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "all",
};
const modalStyles = {
  background: "#fff",
  padding: "32px 36px",
  borderRadius: 18,
  boxShadow: "0 4px 32px 0 rgba(33,41,53,.13)",
  minWidth: 260,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default App;
