import app from "./app";
import { db_connection } from "./config/db.config";
import { config } from "./config/env.config";
import { log } from "./shared/logs/logger";
import cluster from "cluster";
import os from "os";


const PORT = config.port;


process.on('uncaughtException', err => {
  log.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  log.error('💥 Unhandled Rejection:', err);
});


// Cluster setup can be added here in the future
const totalCPUs = os.cpus().length;
console.log(os.cpus().length);

if(cluster.isPrimary){
  for(let i = 0; i < totalCPUs; i++){
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    log.info(`Worker ${worker.process.pid} died. Forking a new worker.`);
    cluster.fork();
  });
}
else {
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

}