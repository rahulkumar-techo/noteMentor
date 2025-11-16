// Description: Initializes Socket.IO once and exposes getter for controllers/services.
import { Server as IOServer } from "socket.io";
import { createServer } from "http";
import { Server } from "node:http";
import { log } from "./shared/logs/logger";

let io: IOServer | null = null;

export function initSocket(server: Server) {
  if (io) return io;
  io = new IOServer(server, {
    cors: {
      origin:"*",
      methods: ["GET", "POST","DELETE","PUT"],
      credentials: true,
    },
     transports: ["websocket", "polling"]// support fallback
  });

  io.on("connection", (socket) => {
   log.info("💬_socket connected", socket.id);
    socket.on("disconnect", () => {
     log.info("💬_socket disconnected", socket.id);
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  return io;
}
