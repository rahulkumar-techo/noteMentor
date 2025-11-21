import app from "./app";
import { db_connection } from "./config/db.config";
import { config } from "./config/env.config";
import { log } from "./shared/logs/logger";
import { createServer } from "node:http";
import { initSocket } from "./socket";

const PORT = config.port || 8000;

process.on("uncaughtException", (err) => {
  log.error(`Uncaught Exception: ${err.message}`);
  log.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  log.error(`Unhandled Rejection: ${reason}`);
});

(async () => {
  try {
    await db_connection();
    log.info(`💽 Connected to MongoDB successfully`);

    const httpServer = createServer(app);

    // Initialize socket.io
    const io = initSocket(httpServer);

    httpServer.listen(PORT, () => {
      log.info(`🚀 Server running on port ${PORT} (${config.nodeEnv})`);
    });

    const gracefulShutdown = () => {
      log.warn(`Server shutting down...`);
      httpServer.close(() => {
        log.info(`Server stopped.`);
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error: any) {
    log.error(`Server failed: ${error.message}`);
    process.exit(1);
  }
})();
