import {pinoHttp} from "pino-http";

export const httpLogger = pinoHttp({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});