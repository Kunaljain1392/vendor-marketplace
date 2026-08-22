import { getRabbitMQChannel } from "../config/rabbitmq.js";
import { logger } from "../config/logger.js";

const VENDOR_EXCHANGE = "VENDOR";

export const setupVendorExchange = async (): Promise<void> => {
  const channel = getRabbitMQChannel();

  await channel.assertExchange(
    VENDOR_EXCHANGE,
    "topic",
    {
      durable: true,
    },
  );

  logger.info(
    { exchange: VENDOR_EXCHANGE },
    "Vendor exchange initialized",
  );
};

export const publishVendorCreated = (
  userId: string,
  vendorId: string,
): void => {
  const channel = getRabbitMQChannel();

  const payload = {
    userId,
    vendorId,
  };

  const published = channel.publish(
    VENDOR_EXCHANGE,
    "vendor.created",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      contentType: "application/json",
    },
  );

  if (!published) {
    logger.warn(
      {
        exchange: VENDOR_EXCHANGE,
        routingKey: "vendor.created",
        vendorId,
      },
      "RabbitMQ write buffer is full",
    );

    return;
  }

  logger.info(
    {
      event: "vendor.created",
      vendorId,
    },
    "Vendor created event published",
  );
};