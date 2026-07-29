import amqp, { Channel, ChannelModel, Connection } from "amqplib";
import { env } from "./env.config.js";
import { logger } from "../utils/logger.js";
import { EXCHANGES } from "../constants/rabbitmq.constants.js";



let connection: ChannelModel;
let channel: Channel;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);

    channel = await connection.createChannel();

        // Create Exchange
    await channel.assertExchange(
      EXCHANGES.AUTH,
      "topic",
      {
        durable: true,
      }
    );

    logger.info("✅ RabbitMQ connected");
  } catch (error) {
    logger.error(error, "❌ RabbitMQ connection failed");
    process.exit(1);
  }
};

export const getChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) await channel.close();

  if (connection) await connection.close();

  logger.info("RabbitMQ disconnected");
};