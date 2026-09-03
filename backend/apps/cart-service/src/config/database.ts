import "reflect-metadata";

import { DataSource } from "typeorm";

import { env } from "./env.js";
import { Cart } from "../entities/cart.entity.js";
import { CartItem } from "../entities/cart-item.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",

  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.database,

  entities: [Cart, CartItem],

  synchronize: true,
  logging: false,
});