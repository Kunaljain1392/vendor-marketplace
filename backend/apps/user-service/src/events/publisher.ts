import { getChannel } from "../config/rabbitmq.js";
import { logger } from "../utils/logger.js";

export const publishEvent = async (
    exchange : string,
    routingKey: string,
    payload: unknown
) : Promise<void> => {
    const channel = getChannel();

    channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        {
            persistent: true,
            contentType: "application/json",
        }
    );
    logger.info({routingKey},"Event published");
}