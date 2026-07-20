import { env } from "./config/env.config.js";
import app from "./app.js"
import { logger } from "./utils/logger.js"

const server = app.listen(env.PORT, ()=> {
    logger.info(`Auth Service started on port ${env.PORT}`)
})

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down Auth Service...`);

  server.close(() => {
    logger.info("HTTP Server closed.");
    process.exit(0);
  });
};


process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

