
import cluster from "cluster";
import os from "os";
import process from "process";
import app from "./app";
import { db_connection } from "./config/db.config";
import { config } from "./config/env.config";
import { log } from "./shared/logs/logger";

const PORT = config.port || 8000;
const isPrimary = cluster.isPrimary;

// leave one CPU for system
const totalCPUs = Math.max(os.cpus().length - 1, 1); 

// Global Error Handlers

process.on("uncaughtException", (err) => {
  log.error(` Uncaught Exception: ${err.message}`);
  log.error(err.stack);
  process.exit(1); // exit immediately
});

process.on("unhandledRejection", (reason: any) => {
  log.error(` Unhandled Rejection: ${reason}`);
});


// Clustered Server Setup

if (isPrimary) {
  log.info(`🧠 Master PID: ${process.pid}`);
  log.info(`🧩 Spawning ${totalCPUs} workers...`);

  // Fork worker processes
  for (let i = 0; i < totalCPUs; i++) cluster.fork();

  // Handle worker exit and respawn
  cluster.on("exit", (worker, code, signal) => {
    log.error(
      `⚰️ Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Restarting...`
    );
    cluster.fork();
  });

} else {
  
  //  🚀 Worker Initialization
  
  (async () => {
    try {
      await db_connection();

      const server = app.listen(PORT, () => {
        log.info(
          ` Worker ${process.pid} | Server running on port ${PORT} (${config.nodeEnv})`
        );
      });

      
      //  * 🧹 Graceful Shutdown
      
      const gracefulShutdown = () => {
        log.warn(`🛑 Worker ${process.pid} shutting down gracefully...`);
        server.close(() => {
          log.info(`💤 Worker ${process.pid} terminated.`);
          process.exit(0);
        });
      };

      process.on("SIGTERM", gracefulShutdown);
      process.on("SIGINT", gracefulShutdown);
    } catch (error: any) {
      log.error(`❌ Worker ${process.pid} failed to start: ${error.message}`);
      process.exit(1);
    }
  })();
}
