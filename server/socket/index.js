import { setupFriends }     from "./friends.js";
import { setupPresence }    from "./presence.js";
import { setupMatchmaking } from "./matchmaking.js";
import { setupGame }        from "./game.js";
import jwt   from "jsonwebtoken";
import prisma from "../config/db.js";

export function initSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true, username: true,
            points: true, avatarId: true,
          },
        });
        if (user) socket.user = user;
      } catch {
        // guest, lanjut
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    setupFriends(io, socket);    // ← pertama, isi userSockets
    setupPresence(io, socket);   // ← kedua, baca userSockets
    setupMatchmaking(io, socket);
    setupGame(io, socket);
  });
}