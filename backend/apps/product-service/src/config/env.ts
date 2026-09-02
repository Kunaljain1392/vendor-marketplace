import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3004),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(1, "JWT_ACCESS_SECRET is required"),

  RABBITMQ_URL: z.string().min(1, "RABBITMQ_URL is required"),

  VENDOR_SERVICE_URL: z
    .string()
    .url("Invalid VENDOR_SERVICE_URL"),

  CORS_ORIGIN: z
    .string()
    .url("Invalid CORS_ORIGIN"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  DEFAULT_PRODUCT_IMAGE_URL: z
    .string()
    .optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
CLOUDINARY_API_KEY: z.string().min(1),
CLOUDINARY_API_SECRET: z.string().min(1),CLOUDINARY_URL: z.string().url(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  console.error(result.error.format());

  process.exit(1);
}

export const env = result.data;