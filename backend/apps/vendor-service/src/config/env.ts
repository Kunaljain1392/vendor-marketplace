import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3003),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(1, "JWT_SECRET is required"),

  LOG_LEVEL: z.string().default("info"),

  RABBITMQ_URL: z.string().min(1),
  
});

export const env = envSchema.parse(process.env);