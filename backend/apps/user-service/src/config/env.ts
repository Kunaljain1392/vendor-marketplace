import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3002),

  CLIENT_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),

  RABBITMQ_URL: z.string().min(1),

  RABBITMQ_EXCHANGE: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);