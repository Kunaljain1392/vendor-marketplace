import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "./env.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  synchronize: env.NODE_ENV === "development",
  logging: false,
  entities: ["src/entities/**/*.entity.ts"],
  migrations: ["src/migrations/**/*.ts"],
});