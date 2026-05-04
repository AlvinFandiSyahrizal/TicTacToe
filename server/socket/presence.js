import { userSockets } from "./friends.js";

export function setupPresence(io, socket) {
  // Register kalau ada user
  if (socket.user) {
    userSockets.set(socket.user.id, socket.id);
  }

  // Emit ke semua client setiap ada yang connect
  io.emit("online:count", userSockets.size);

  // Emit khusus ke yang baru connect biar langsung dapat angka
  socket.emit("online:count", userSockets.size);

  socket.on("disconnect", () => {
    if (socket.user) {
      userSockets.delete(socket.user.id);
    }
    io.emit("online:count", userSockets.size);
  });
}