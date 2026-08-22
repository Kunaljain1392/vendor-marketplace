import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { Vendor } from "../entities/vendor.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,

  entities: [Vendor],

  synchronize: true,
  logging: false,
});