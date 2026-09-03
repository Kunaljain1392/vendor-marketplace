import "reflect-metadata";

import app from "./app.js";
import { env } from "./config/env.js";
import { AppDataSource } from "./config/database.js";
import { logger } from "./config/logger.js";

async function startServer(): Promise<void> {
  try {
    await AppDataSource.initialize();

    logger.info("Cart database connected successfully");

    app.listen(env.port, () => {
      logger.info(
        {
          port: env.port,
          environment: env.nodeEnv,
        },
        "Cart Service started",
      );
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start Cart Service");
    process.exit(1);
  }
}

void startServer();