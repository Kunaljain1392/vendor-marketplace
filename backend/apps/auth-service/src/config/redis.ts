import {Redis} from "ioredis";
import { env } from "./env.config.js";
import { logger } from "../utils/logger.js";

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
  logger.info("✅ Redis connected");
});

redisClient.on("ready", () => {
  logger.info("🚀 Redis is ready");
});

redisClient.on("error", (error) => {
  logger.error(error, "Redis connection error");
});

redisClient.on("close", () => {
  logger.warn("Redis connection closed");
});