import { getRabbitMQChannel, EXCHANGE_NAME } from "../config/rabbitmq.js";
import { logger } from "../config/logger.js";

export const publishInventoryEvent = (
  routingKey: string,
  payload: Record<string, unknown>,
): void => {
  try {
    const channel = getRabbitMQChannel();

    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        contentType: "application/json",
        persistent: true,
      },
    );

    logger.info(
      {
        routingKey,
      },
      "Inventory event published",
    );
  } catch (error) {
    logger.warn(
      {
        err: error,
        routingKey,
      },
      "Failed to publish inventory event",
    );
  }
};