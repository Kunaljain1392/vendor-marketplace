import "reflect-metadata";
import app from "./app.js";
import { env } from "./config/env.js";
import { AppDataSource } from "./config/database.js";
import { logger } from "./config/logger.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { setupVendorExchange } from "./events/vendor.events.js";

const startServer = async () => {
  try {
    await AppDataSource.initialize();

    console.log("Database connected successfully");
    logger.info("Database connected successfully");

    await connectRabbitMQ();

     await setupVendorExchange();

    app.listen(env.PORT, () => {
        logger.info(`Vendor Service running on port ${env.PORT}`);
      console.log(`Vendor Service running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start Vendor Service");
    console.error("Failed to start Vendor Service:", error);
    process.exit(1);
  }
};

startServer();