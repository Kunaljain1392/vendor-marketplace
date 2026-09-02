import amqp, {
  Channel,
  ChannelModel,
} from "amqplib";

import { env } from "./env";
import { logger } from "./logger";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const getRabbitChannel = async (): Promise<Channel> => {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(env.RABBITMQ_URL);

  channel = await connection.createChannel();

  logger.info("RabbitMQ connected successfully");

  return channel;
};