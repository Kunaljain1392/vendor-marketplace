import { env } from "./env.js"
import { EXCHANGES } from "../constants/rabbitmq.constants.js";
import { logger } from "../utils/logger.js";
import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib"
let connection: ChannelModel;
let channel: Channel;

export const connectRabbitMQ = async () : Promise<void> => {
    try {
        connection = await amqp.connect(env.RABBITMQ_URL);

        channel = await connection.createChannel();

        await channel.assertExchange(
            EXCHANGES.USER,
            "topic",
            {
                durable: true,
            }
        );

        logger.info("RabbitMQ connected");
    } catch (error) {
        logger.error(error, "RabbitMQ connection failed");
        process.exit(1);
    }
};

export const getChannel = (): Channel => {
    if(!channel) {
        throw new Error("RabbitMQ channel not initialized");
    }
    return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
    if(channel) await channel.close();

    if(connection) await connection.close();

    logger.info("RabbitMQ disconnected");
};