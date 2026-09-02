import { getRabbitChannel } from "../config/rabbitmq";
import { logger } from "../config/logger";

const EXCHANGE_NAME = "vendor_marketplace";

export const publishEvent = async (
  routingKey: string,
  payload: unknown,
): Promise<void> => {
  const channel = await getRabbitChannel();

  await channel.assertExchange(
    EXCHANGE_NAME,
    "topic",
    {
      durable: true,
    },
  );

  const message = Buffer.from(
    JSON.stringify(payload),
  );

  const published = channel.publish(
    EXCHANGE_NAME,
    routingKey,
    message,
    {
      persistent: true,
      contentType: "application/json",
    },
  );

  if (!published) {
    logger.warn(
      { routingKey },
      "RabbitMQ channel buffer is full",
    );
  }

  logger.info(
    { routingKey },
    "Product event published",
  );
};