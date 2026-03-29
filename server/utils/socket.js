const { Server } = require("socket.io");

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL || "http://localhost:5173"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, getIO, emitToUser };

