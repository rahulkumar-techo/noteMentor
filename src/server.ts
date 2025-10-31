import app from "./app";
import { db_connection } from "./config/db.config";
import { config } from "./config/env.config";
import { log } from "./shared/logs/logger";


const PORT = config.port;


process.on('uncaughtException', err => {
  log.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  log.error('💥 Unhandled Rejection:', err);
});

(async () => {
  try {
    await db_connection();
    app.listen(PORT, () => {
      log.info(`📍Server started on port ${PORT} in ${config.nodeEnv} mode`);
    });
  } catch (error: any) {
    log.error(`Failed to start server:\n ${error.message}`);
  }
})();