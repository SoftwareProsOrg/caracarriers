import pino from "pino";
import { env } from "@/lib/env";

const isDevelopment = env.NODE_ENV === "development";

export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }
    : undefined,
  base: {
    env: env.NODE_ENV,
    version: process.env.npm_package_version,
  },
});

export const log = {
  info: (msg: string, payload?: object) => logger.info(payload || {}, msg),
  warn: (msg: string, payload?: object) => logger.warn(payload || {}, msg),
  error: (msg: string, payload?: object | Error) => {
    if (payload instanceof Error) {
      logger.error({ err: payload }, msg);
    } else {
      logger.error(payload || {}, msg);
    }
  },
  debug: (msg: string, payload?: object) => logger.debug(payload || {}, msg),
};
