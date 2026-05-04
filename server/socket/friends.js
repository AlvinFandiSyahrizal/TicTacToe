import prisma from "../config/db.js";

export const userSockets = new Map();
const pendingChallenges  = new Map();

export function setupFriends(io, socket) {

  if (socket.user) {
    userSockets.set(socket.user.id, socket.id);
  }

  function notifyUser(toUserId, event, data) {
    const sid = userSockets.get(toUserId);
    if (sid) {
      io.to(sid).emit(event, data);
      return true;
    }
    return false;
  }

  socket.on("friends:notify", ({ toUserId, type, data }) => {
    if (!socket.user) return;
    notifyUser(toUserId, "friends:notification", { type, data });
  });

  socket.on("friends:challenge", ({ toUserId }) => {
    if (!socket.user) return;
    const myId = socket.user.id;

    const existing = pendingChallenges.get(myId);
    if (existing && existing.toUserId === toUserId && Date.now() < existing.expiresAt) {
      socket.emit("friends:challengeError", {
        message: "Undangan sudah terkirim, tunggu respons atau kedaluwarsa",
      });
      return;
    }

    const expiresAt = Date.now() + 5 * 60 * 1000;
    pendingChallenges.set(myId, { toUserId, expiresAt });

    setTimeout(() => {
      const cur = pendingChallenges.get(myId);
      if (cur && cur.toUserId === toUserId) {
        pendingChallenges.delete(myId);
      }
    }, 5 * 60 * 1000);

    const sent = notifyUser(toUserId, "friends:challenged", {
      from: {
        id:       myId,
        username: socket.user.username,
        avatarId: socket.user.avatarId,
        points:   socket.user.points,
      },
      socketId:  socket.id,
      expiresAt,
    });

    if (!sent) {
      pendingChallenges.delete(myId);
      socket.emit("friends:challengeError", {
        message: "Teman sedang offline",
      });
    }
  });

  socket.on("friends:acceptChallenge", ({ toSocketId }) => {
    if (!socket.user) return;

    const targetSocket = io.sockets.sockets.get(toSocketId);
    if (!targetSocket?.user) {
      socket.emit("friends:challengeError", {
        message: "Lawan sudah offline atau sesi habis",
      });
      return;
    }

    pendingChallenges.delete(targetSocket.user.id);

    const roomId    = `friend_${Date.now()}`;
    const firstTurn = Math.random() < 0.5
      ? socket.user.id
      : targetSocket.user.id;

    socket.join(roomId);
    targetSocket.join(roomId);

    const matchData = {
      roomId,
      gameId:       null,
      firstTurn,
      isFriendGame: true,
      player1: {
        id:       targetSocket.user.id,
        username: targetSocket.user.username,
        avatarId: targetSocket.user.avatarId,
        points:   targetSocket.user.points,
      },
      player2: {
        id:       socket.user.id,
        username: socket.user.username,
        avatarId: socket.user.avatarId,
        points:   socket.user.points,
      },
    };

    io.to(roomId).emit("friends:gameReady", matchData);
  });

  socket.on("friends:declineChallenge", ({ toSocketId }) => {
    if (!socket.user) return;
    const targetSocket = io.sockets.sockets.get(toSocketId);
    if (targetSocket?.user) {
      pendingChallenges.delete(targetSocket.user.id);
    }
    io.to(toSocketId).emit("friends:challengeDeclined", {
      username: socket.user.username,
    });
  });

  socket.on("friends:getOnline", async () => {
    if (!socket.user) return;
    try {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: socket.user.id, status: "accepted" },
            { receiverId: socket.user.id, status: "accepted" },
          ],
        },
        select: { senderId: true, receiverId: true },
      });

      const friendIds = friendships.map((f) =>
        f.senderId === socket.user.id ? f.receiverId : f.senderId
      );

      const onlineIds = friendIds.filter((id) => userSockets.has(id));
      socket.emit("friends:onlineList", onlineIds);
    } catch (err) {
      console.error("friends:getOnline error:", err);
    }
  });

  socket.on("friends:saveGame", async ({ player1Id, player2Id, winnerId }) => {
    if (!socket.user) return;
    try {
      await prisma.friendGame.create({
        data: { player1Id, player2Id, winnerId: winnerId || null },
      });
    } catch (err) {
      console.error("friends:saveGame error:", err);
    }
  });

  socket.on("disconnect", () => {
    if (socket.user) {
      userSockets.delete(socket.user.id);
      pendingChallenges.delete(socket.user.id);
      io.emit("online:count", userSockets.size);
    }
  });
}