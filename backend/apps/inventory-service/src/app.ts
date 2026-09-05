import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { logger } from "./config/logger";
import inventoryRoutes from "./routes/inventory.routes.js";
import swaggerUi from "swagger-ui-express";

import { swaggerDocument } from "./config/swagger.js";

const app = express();

app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(
  "/api-docs",
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerDocument) as any,
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "inventory-service",
  });
});

app.use("/inventory", inventoryRoutes);

export default app;