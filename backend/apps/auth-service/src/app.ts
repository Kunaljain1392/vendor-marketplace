import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { httpLogger } from "./middleware/logger.middleware.js";
import authRoutes from './routes/auth.route.js';
import cookieParser from "cookie-parser";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app: Application = express();
// security middleware
// basically it provides additonal rule sets to browser to handle res
app.use(helmet());

// cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true,
}))
// parse req.body into json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser 
app.use(cookieParser());

// compress Response
app.use(compression());

// HTTP request logger
app.use(httpLogger);

// health check
app.get("/health", (_,res)=> {
    res.status(200).json({
        success: true,
        service: "auth-service",
        status: "healthy",
    })
})

app.use('/api/auth', authRoutes);

// error handling 
app.use(notFoundHandler);
app.use(globalErrorHandler);
export default app;