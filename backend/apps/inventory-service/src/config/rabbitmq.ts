import amqp, { Channel, ChannelModel } from "amqplib";

import { env } from "./env.js";
import { logger } from "./logger.js";

const EXCHANGE_NAME = "vendor_marketplace_events";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", {
      durable: true,
    });

    connection.on("error", (error) => {
      logger.error(
        {
          err: error,
        },
        "RabbitMQ connection error",
      );
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    logger.info("RabbitMQ connected");
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Failed to connect to RabbitMQ",
    );

    throw error;
  }
};

export const getRabbitMQChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  return channel;
};

export { EXCHANGE_NAME };