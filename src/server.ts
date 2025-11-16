import cluster from "cluster";
import os from "os";
import process from "process";
import app from "./app";
import { db_connection } from "./config/db.config";
import { config } from "./config/env.config";
import { log } from "./shared/logs/logger";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { initSocket } from "./socket";

const PORT = config.port || 8000;
const isPrimary = cluster.isPrimary;
const totalCPUs = Math.max(os.cpus().length - 1, 1);

process.on("uncaughtException", (err) => {
  log.error(`Uncaught Exception: ${err.message}`);
  log.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  log.error(`Unhandled Rejection: ${reason}`);
});

if (isPrimary) {
  log.info(`Master PID: ${process.pid}`);
  log.info(`Spawning ${totalCPUs} workers...`);

  for (let i = 0; i < totalCPUs; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    log.error(
      `Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Restarting...`
    );
    cluster.fork();
  });

} else {
  (async () => {
    try {
      await db_connection();
      log.info(`🔗Worker ${process.pid}: Database connected.`);

      const httpServer = createServer(app);

      // initialize socket.io
      const io = initSocket(httpServer);

      httpServer.listen(PORT, () => {
        log.info(
          `🖥️ Worker ${process.pid} running on port ${PORT} (${config.nodeEnv})`
        );
      });

      const gracefulShutdown = () => {
        log.warn(`Worker ${process.pid} shutting down...`);
        httpServer.close(() => {
          log.info(`Worker ${process.pid} stopped.`);
          process.exit(0);
        });
      };

      process.on("SIGTERM", gracefulShutdown);
      process.on("SIGINT", gracefulShutdown);

    } catch (error: any) {
      log.error(`Worker ${process.pid} failed: ${error.message}`);
      process.exit(1);
    }
  })();
}
