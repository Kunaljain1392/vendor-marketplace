import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger";
import type { RequestHandler } from "express";

const app = express();

const swaggerServe =
  swaggerUi.serve as unknown as RequestHandler;

const swaggerSetup =
  swaggerUi.setup(swaggerSpec) as unknown as RequestHandler;

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(compression());

app.use(cookieParser());

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Product Service is healthy",
  });
});

app.use("/docs", swaggerServe, swaggerSetup);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;