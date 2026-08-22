import express from "express";
import type { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { httpLogger } from "./middleware/logger.middleware.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import { swaggerUi, swaggerDocument } from "./config/swagger.js";


const app: Application = express();

app.use(helmet());



app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
)
app.use(express.json())

app.use(express.urlencoded({ extended: true}))

app.use(cookieParser())

app.use(compression());

app.use(httpLogger);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.get("/health",(_req,res) => {
    res.status(200).json({
        "success": true,
        "service": "user-service",
        "status": "healthy"
    })
})

app.use("/api/profile", profileRoutes);

app.use(globalErrorHandler);

export default app;