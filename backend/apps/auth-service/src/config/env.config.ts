import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'), 
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // FIXED: Using .min(1) with custom message instead of required_error
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  JWT_ACCESS_SECRET: z.string().min(1, { message: 'JWT_ACCESS_SECRET is required' }),
  JWT_REFRESH_SECRET: z.string().min(1, { message: 'JWT_REFRESH_SECRET is required' }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid or missing environment variables:\n', parsedEnv.error.format());
  process.exit(1); // Stop the application immediately
}

// Export the validated env object to be used across the app
export const env = parsedEnv.data;