import { checkWinner, checkDraw, getEmptyCells, applyMove } from "./gameEngine";

// ================================
// LEVEL 1: Random Bot
// ================================
export function randomMove(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// ================================
// LEVEL 2: Minimax Bot (unbeatable)
// ================================

/**
 * Minimax algorithm
 * @param {Array} board
 * @param {boolean} isMaximizing - true = giliran bot (O), false = giliran player (X)
 * @returns {number} score
 */
function minimax(board, isMaximizing) {
  const { winner } = checkWinner(board);

  if (winner === "O") return 10;   // bot menang
  if (winner === "X") return -10;  // player menang
  if (checkDraw(board)) return 0;  // draw

  const empty = getEmptyCells(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const index of empty) {
      const newBoard = applyMove(board, index, "O");
      const score = minimax(newBoard, false);
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const index of empty) {
      const newBoard = applyMove(board, index, "X");
      const score = minimax(newBoard, true);
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

/**
 * Cari move terbaik untuk bot
 * @param {Array} board
 * @returns {number} index terbaik
 */
export function minimaxMove(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;

  let bestScore = -Infinity;
  let bestIndex = null;

  for (const index of empty) {
    const newBoard = applyMove(board, index, "O");
    const score = minimax(newBoard, false);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex;
}

// ================================
// Pilih bot berdasarkan difficulty
// ================================
export function getBotMove(board, difficulty = "easy") {
  if (difficulty === "easy") return randomMove(board);
  if (difficulty === "hard") return minimaxMove(board);

  // medium: 50% minimax, 50% random
  return Math.random() > 0.5 ? minimaxMove(board) : randomMove(board);
}