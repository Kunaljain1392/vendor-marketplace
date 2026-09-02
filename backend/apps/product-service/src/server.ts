import app from "./app";
import { AppDataSource } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { getRabbitChannel } from "./config/rabbitmq";

const startServer = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();

    logger.info("PostgreSQL connected successfully");

    await getRabbitChannel();

    app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT },
        "Product Service started successfully",
      );
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to start Product Service",
    );

    process.exit(1);
  }
};

startServer();