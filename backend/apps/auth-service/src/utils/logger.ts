
import pino from 'pino';
import { env } from "../config/env.config.js";

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Format logs nicely for development, keep raw JSON for production
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname', // Clean up output by removing unnecessary info
          },
        }
      : undefined,
});