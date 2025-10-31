import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Express } from "express";
import { config } from "./env.config";

/**
 * Applies security middlewares globally
 */
export const setupSecurity = (app: Express) => {
  app.use(helmet());
  app.use(cors({ origin: config.frontendUrl, credentials: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 100,
    message: "Too many requests, try again later.",
  });
  app.use(limiter);
};
