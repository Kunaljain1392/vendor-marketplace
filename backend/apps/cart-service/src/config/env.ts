import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 3006),
  jwt: {
  secret: getRequiredEnv("JWT_SECRET"),
},
  database: {
    host: getRequiredEnv("DB_HOST"),
    port: Number(process.env.DB_PORT || 5432),
    username: getRequiredEnv("DB_USERNAME"),
    password: getRequiredEnv("DB_PASSWORD"),
    database: getRequiredEnv("DB_DATABASE"),
  },

  services: {
    productServiceUrl: getRequiredEnv("PRODUCT_SERVICE_URL"),
  },

  rabbitmq: {
    url: getRequiredEnv("RABBITMQ_URL"),
  },
};