import amqp, { type Channel, type ChannelModel } from "amqplib";

import { env } from "./env.js";
import { logger } from "./logger.js";

const EXCHANGE_NAME = "vendor_marketplace_events";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function initializeRabbitMQ(): Promise<void> {
  try {
    connection = await amqp.connect(env.rabbitmq.url);

    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", {
      durable: true,
    });

    logger.info(
      {
        exchange: EXCHANGE_NAME,
      },
      "RabbitMQ connected successfully",
    );

    connection.on("error", (error) => {
      logger.error(
        {
          error,
        },
        "RabbitMQ connection error",
      );
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");

      connection = null;
      channel = null;
    });
  } catch (error) {
    logger.error(
      {
        error,
      },
      "Failed to connect to RabbitMQ",
    );

    connection = null;
    channel = null;
  }
}

export async function publishCartEvent(
  eventType: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (!channel) {
    logger.warn(
      {
        eventType,
      },
      "RabbitMQ unavailable, skipping cart event",
    );

    return;
  }

  try {
    const message = Buffer.from(
      JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        data,
      }),
    );

    channel.publish(
      EXCHANGE_NAME,
      eventType,
      message,
      {
        persistent: true,
        contentType: "application/json",
      },
    );

    logger.info(
      {
        eventType,
      },
      "Cart event published",
    );
  } catch (error) {
    logger.error(
      {
        eventType,
        error,
      },
      "Failed to publish cart event",
    );
  }
}