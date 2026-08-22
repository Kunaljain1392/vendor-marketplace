import amqp, { type Channel, type ChannelModel } from "amqplib";
import { env } from "./env.js";
import { logger } from "./logger.js";

let connection: ChannelModel;
let channel: Channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(env.RABBITMQ_URL);

  channel = await connection.createChannel();

  logger.info("RabbitMQ connected successfully");

  return channel;
};

export const getRabbitMQChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  return channel;
};