import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import PinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import vendorRoutes from "./routes/vendor.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { swaggerUi, swaggerDocument } from "./config/swagger.js";

const app: Express = express();



app.use(helmet());

app.use(cors());

app.use(compression());

app.use(PinoHttp.default());

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.use("/api/vendors", vendorRoutes);

app.get("/health", (_req, res) => {
    logger.info("Health check called");
  res.status(200).json({
    success: true,
    message: "Vendor Service is running",
  });
});

app.use(errorHandler);

export default app;