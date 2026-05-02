export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

export function checkDraw(board) {
  return board.every((cell) => cell !== null);
}

export function createBoard() {
  return Array(9).fill(null);
}

export function applyMove(board, index, player) {
  if (board[index] !== null) return board;
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
}

export function getEmptyCells(board) {
  return board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);
}

/**
 * Tentukan siapa jalan pertama ronde berikutnya
 * - Kalau ada yang kalah → yang kalah duluan
 * - Kalau draw → flip coin lagi
 * @param {"X"|"O"|null} lastWinner - pemenang ronde lalu, null = draw
 * @returns {"X"|"O"} siapa yang jalan pertama ("X" = player, "O" = bot)
 */
export function determineFirstPlayer(lastWinner) {
  if (lastWinner === null) return coinFlip(); // draw → flip lagi
  return lastWinner === "X" ? "O" : "X";     // yang kalah duluan
}

/**
 * Coin flip murni random
 * @returns {"X"|"O"}
 */
export function coinFlip() {
  return Math.random() < 0.5 ? "X" : "O";
}