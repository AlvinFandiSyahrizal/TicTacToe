import prisma from "../config/db.js";

const queue = new Map(); // socketId → { socket, user, joinedAt }

export function setupMatchmaking(io, socket) {

  // Player join queue
  socket.on("matchmaking:join", () => {
    if (!socket.user) {
      socket.emit("matchmaking:error", { message: "Harus login dulu untuk ranked" });
      return;
    }

    if (queue.has(socket.id)) return; // sudah di queue

    queue.set(socket.id, {
      socket,
      user: socket.user,
      joinedAt: Date.now(),
    });

    socket.emit("matchmaking:waiting", { position: queue.size });

    // Broadcast jumlah di queue
    io.emit("matchmaking:queueSize", queue.size);

    // Coba match
    tryMatch(io);
  });

  // Player cancel queue
  socket.on("matchmaking:cancel", () => {
    queue.delete(socket.id);
    io.emit("matchmaking:queueSize", queue.size);
    socket.emit("matchmaking:cancelled");
  });

  // Kalau disconnect saat di queue
  socket.on("disconnect", () => {
    if (queue.has(socket.id)) {
      queue.delete(socket.id);
      io.emit("matchmaking:queueSize", queue.size);
    }
  });
}

async function tryMatch(io) {
  if (queue.size < 2) return;

  const entries = [...queue.entries()];
  const [id1, p1] = entries[0];
  const [id2, p2] = entries[1];

  // Hapus dari queue
  queue.delete(id1);
  queue.delete(id2);
  io.emit("matchmaking:queueSize", queue.size);

  // Buat room ID
  const roomId = `game_${id1}_${id2}_${Date.now()}`;

  // Join room
  p1.socket.join(roomId);
  p2.socket.join(roomId);

  // Simpan game ke DB
  const game = await prisma.game.create({
    data: {
      player1Id: p1.user.id,
      player2Id: p2.user.id,
      endReason: "ongoing",
    },
  });

  // Coin flip siapa duluan
  const firstTurn = Math.random() < 0.5 ? p1.user.id : p2.user.id;

  const matchData = {
    roomId,
    gameId: game.id,
    firstTurn,
    player1: { id: p1.user.id, username: p1.user.username, avatarId: p1.user.avatarId, points: p1.user.points },
    player2: { id: p2.user.id, username: p2.user.username, avatarId: p2.user.avatarId, points: p2.user.points },
  };

  // Kasih tau kedua player
  io.to(roomId).emit("matchmaking:matched", matchData);
}