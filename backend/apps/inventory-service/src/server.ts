import app from "./app.js";
import { env } from "./config/env.js";
import { AppDataSource } from "./config/database.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { logger } from "./config/logger.js";

const startServer = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();

    logger.info("PostgreSQL connected");

    await connectRabbitMQ();

    app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
        },
        "Inventory Service started",
      );
    });
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Failed to start Inventory Service",
    );

    process.exit(1);
  }
};

void startServer();