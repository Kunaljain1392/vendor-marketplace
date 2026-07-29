import { env } from "./config/env.config.js";
import app from "./app.js"
import { logger } from "./utils/logger.js"
import "./config/redis.js";
import { redisClient } from "./config/redis.js";
import { connectRabbitMQ, closeRabbitMQ } from "./config/rabbitmq.js";
import { Server } from "http";


let server: Server;

const startServer = async () => {
  await connectRabbitMQ();

  server = app.listen(env.PORT, () => {
    logger.info(`Auth Service started on port ${env.PORT}`);
  });
};

startServer();

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down Auth Service...`);

  server.close( async () => {
    logger.info("HTTP Server closed.");
     await redisClient.quit();
     await closeRabbitMQ();

    logger.info("Redis disconnected.");

    process.exit(0);
  });
};


process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

