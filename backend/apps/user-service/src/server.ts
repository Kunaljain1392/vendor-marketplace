import "dotenv/config";
import app from "./app.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { logger } from "./utils/logger.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectRabbitMQ();

    app.listen(env.PORT, () => {
      logger.info(`User Service running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start User Service");
    process.exit(1);
  }
};

startServer();