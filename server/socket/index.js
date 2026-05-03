import { setupPresence } from "./presence.js";
import { setupMatchmaking } from "./matchmaking.js";
import { setupGame } from "./game.js";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export function initSocket(io) {

  // Middleware — verifikasi token kalau ada, guest tetap boleh connect
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, username: true, points: true, avatarId: true },
        });
        if (user) socket.user = user;
      } catch {
        // token invalid, lanjut sebagai guest
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    setupPresence(io, socket);
    setupMatchmaking(io, socket);
    setupGame(io, socket);
  });
}
