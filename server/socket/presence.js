import { userSockets } from "./friends.js";

// Hitung semua socket yang connect, bukan hanya yang login
export function setupPresence(io, socket) {
  if (socket.user) {
    userSockets.set(socket.user.id, socket.id);
  }

  // Pakai io.sockets.sockets.size untuk total semua koneksi
  // Atau pakai userSockets.size kalau mau hitung logged-in user saja
  const count = userSockets.size; // hanya user yang login
  io.emit("online:count", count);
  socket.emit("online:count", count);

  socket.on("disconnect", () => {
    if (socket.user) {
      userSockets.delete(socket.user.id);
    }
    io.emit("online:count", userSockets.size);
  });
}