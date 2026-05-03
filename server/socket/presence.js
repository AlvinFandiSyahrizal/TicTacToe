const onlineUsers = new Map(); // socketId → { username, avatarId, points }

export function setupPresence(io, socket) {
  // Register user online
  if (socket.user) {
    onlineUsers.set(socket.id, {
      username: socket.user.username,
      avatarId: socket.user.avatarId,
      points: socket.user.points,
    });
  }

  // Broadcast jumlah online ke semua
  io.emit("online:count", onlineUsers.size);

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("online:count", onlineUsers.size);
  });
}

export function getOnlineUsers() {
  return onlineUsers;
}
