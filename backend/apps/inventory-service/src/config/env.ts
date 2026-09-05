import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3006),

  DATABASE_URL: z.string().min(1),

  RABBITMQ_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),

  PRODUCT_SERVICE_URL: z
    .string()
    .url()
    .default("http://localhost:3004"),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = envSchema.parse(process.env);