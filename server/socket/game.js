import prisma from "../config/db.js";

const WINNING_COMBINATIONS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

function checkDraw(board) {
  return board.every((c) => c !== null);
}

const games = new Map();
const disconnectTimers = new Map();

export function setupGame(io, socket) {

  // ── Init game ─────────────────────────────────────────────────────────
  socket.on("game:init", ({ roomId, gameId, firstTurn, player1, player2, isFriendGame }) => {
    if (!games.has(roomId)) {
      games.set(roomId, {
        gameId,
        board: Array(9).fill(null),
        currentTurn: firstTurn,
        player1,
        player2,
        isFriendGame: isFriendGame || false,
        timers: {},
      });
    }

    const game = games.get(roomId);
    socket.join(roomId);

    socket.emit("game:state", {
      board: game.board,
      currentTurn: game.currentTurn,
      player1: game.player1,
      player2: game.player2,
    });

    startTurnTimer(io, roomId);
  });

  // ── Reconnect ─────────────────────────────────────────────────────────
  socket.on("game:reconnect", ({ roomId }) => {
    if (!socket.user) return;

    // Batalkan disconnect timer kalau ada
    const timerKey = `${roomId}_${socket.user.id}`;
    const timer = disconnectTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      disconnectTimers.delete(timerKey);
    }

    const game = games.get(roomId);
    if (!game) {
      socket.emit("game:notFound");
      return;
    }

    socket.join(roomId);
    socket.emit("game:state", {
      board: game.board,
      currentTurn: game.currentTurn,
      player1: game.player1,
      player2: game.player2,
    });
  });

  // ── Move ──────────────────────────────────────────────────────────────
  socket.on("game:move", ({ roomId, index }) => {
    if (!socket.user) return;

    const game = games.get(roomId);
    if (!game) return;

    if (game.currentTurn !== socket.user.id) {
      socket.emit("game:error", { message: "Bukan giliran kamu" });
      return;
    }

    if (game.board[index] !== null) {
      socket.emit("game:error", { message: "Cell sudah terisi" });
      return;
    }

    const symbol = socket.user.id === game.player1.id ? "X" : "O";
    game.board[index] = symbol;

    clearTurnTimer(roomId);

    const { winner, line } = checkWinner(game.board);
    const draw = !winner && checkDraw(game.board);

    if (winner || draw) {
      const winnerId = winner
        ? (symbol === "X" ? game.player1.id : game.player2.id)
        : null;

      io.to(roomId).emit("game:over", {
        board: game.board,
        winner: winnerId,
        winningLine: line,
        isDraw: draw,
      });

      endGame(io, roomId, winnerId, "normal");
    } else {
      game.currentTurn = socket.user.id === game.player1.id
        ? game.player2.id
        : game.player1.id;

      io.to(roomId).emit("game:update", {
        board: game.board,
        currentTurn: game.currentTurn,
        lastMove: index,
      });

      startTurnTimer(io, roomId);
    }
  });

  // ── Surrender ─────────────────────────────────────────────────────────
  socket.on("game:surrender", ({ roomId }) => {
    if (!socket.user) return;
    const game = games.get(roomId);
    if (!game) return;

    clearTurnTimer(roomId);
    const winnerId = socket.user.id === game.player1.id
      ? game.player2.id
      : game.player1.id;

    io.to(roomId).emit("game:over", {
      board: game.board,
      winner: winnerId,
      winningLine: null,
      isDraw: false,
      reason: "surrender",
      surrenderedBy: socket.user.id,
    });

    endGame(io, roomId, winnerId, "surrender");
  });

  // ── Disconnect ────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    for (const [roomId, game] of games.entries()) {
      const isPlayer =
        socket.user?.id === game.player1?.id ||
        socket.user?.id === game.player2?.id;

      if (!isPlayer) continue;

      // Grace period 30 detik sebelum dianggap benar-benar disconnect
      const timerKey = `${roomId}_${socket.user.id}`;
      const timer = setTimeout(() => {
        const currentGame = games.get(roomId);
        if (!currentGame) return;

        const winnerId = socket.user.id === currentGame.player1.id
          ? currentGame.player2.id
          : currentGame.player1.id;

        io.to(roomId).emit("game:over", {
          board: currentGame.board,
          winner: winnerId,
          winningLine: null,
          isDraw: false,
          reason: "disconnect",
          disconnectedBy: socket.user.id,
        });

        clearTurnTimer(roomId);
        endGame(io, roomId, winnerId, "disconnect");
        disconnectTimers.delete(timerKey);
      }, 30000);

      disconnectTimers.set(timerKey, timer);
      break;
    }
  });
}

// ── Timer giliran ────────────────────────────────────────────────────────
function startTurnTimer(io, roomId) {
  const game = games.get(roomId);
  if (!game) return;

  game.timers.turn = setTimeout(() => {
    const emptyCells = game.board
      .map((cell, i) => cell === null ? i : null)
      .filter((i) => i !== null);

    if (emptyCells.length === 0) return;

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const currentPlayer = game.currentTurn === game.player1.id ? game.player1 : game.player2;
    const symbol = game.currentTurn === game.player1.id ? "X" : "O";

    game.board[randomIndex] = symbol;

    const { winner, line } = checkWinner(game.board);
    const draw = !winner && checkDraw(game.board);

    if (winner || draw) {
      const winnerId = winner
        ? (symbol === "X" ? game.player1.id : game.player2.id)
        : null;

      io.to(roomId).emit("game:over", {
        board: game.board,
        winner: winnerId,
        winningLine: line,
        isDraw: draw,
        reason: "timeout",
        timedOutBy: currentPlayer.id,
      });

      endGame(io, roomId, winnerId, "timeout");
    } else {
      game.currentTurn = game.currentTurn === game.player1.id
        ? game.player2.id
        : game.player1.id;

      io.to(roomId).emit("game:update", {
        board: game.board,
        currentTurn: game.currentTurn,
        lastMove: randomIndex,
        reason: "timeout",
      });

      setTimeout(() => startTurnTimer(io, roomId), 1000);
    }
  }, 15000);
}

function clearTurnTimer(roomId) {
  const game = games.get(roomId);
  if (game?.timers?.turn) {
    clearTimeout(game.timers.turn);
    game.timers.turn = null;
  }
}

// ── End game ──────────────────────────────────────────────────────────────
async function endGame(io, roomId, winnerId, reason) {
  const game = games.get(roomId);
  if (!game) return;

  if (game.isFriendGame) {
    try {
      await prisma.friendGame.create({
        data: {
          player1Id: game.player1.id,
          player2Id: game.player2.id,
          winnerId: winnerId || null,
        },
      });
    } catch (err) {
      console.error("friendGame save error:", err);
    }
    games.delete(roomId);
    return;
  }

  const POINTS_WIN  =  25;
  const POINTS_LOSE = -15;
  const POINTS_DRAW =   5;

  try {
    if (winnerId) {
      const loserId = winnerId === game.player1.id
        ? game.player2.id
        : game.player1.id;

      await prisma.user.update({
        where: { id: winnerId },
        data: { points: { increment: POINTS_WIN }, wins: { increment: 1 } },
      });
      await prisma.user.update({
        where: { id: loserId },
        data: { points: { increment: POINTS_LOSE }, losses: { increment: 1 } },
      });
      await prisma.game.update({
        where: { id: game.gameId },
        data: {
          winner: winnerId === game.player1.id ? "player1" : "player2",
          endReason: reason,
          pointChange: POINTS_WIN,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: game.player1.id },
        data: { points: { increment: POINTS_DRAW }, draws: { increment: 1 } },
      });
      await prisma.user.update({
        where: { id: game.player2.id },
        data: { points: { increment: POINTS_DRAW }, draws: { increment: 1 } },
      });
      await prisma.game.update({
        where: { id: game.gameId },
        data: { winner: "draw", endReason: reason, pointChange: POINTS_DRAW },
      });
    }
  } catch (err) {
    console.error("endGame DB error:", err);
  }

  games.delete(roomId);
}