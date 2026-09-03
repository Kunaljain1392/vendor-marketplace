import compression from "compression";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { swaggerMiddleware } from "./config/swagger.js";
import cartRoutes from "./routes/cart.routes.js";
const app: Express = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp());

app.use(
  pinoHttp({
    logger,
  }),
);

app.use("/api-docs", ...swaggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "cart-service is healthy",
  });
});

app.use("/cart", cartRoutes);

app.use(errorMiddleware);

export default app;