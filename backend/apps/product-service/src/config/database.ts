import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "./env.js";
import { Product } from "../entities/product.entity.js";
import { ProductMedia } from "../entities/product-media.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,

  entities: [Product, ProductMedia],

  migrations: ["src/migrations/**/*.ts"],

  synchronize: true,

  logging: false,
});