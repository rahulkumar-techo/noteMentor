/**
 * Final Clean App Setup
 * - No sessions
 * - Passport only for OAuth redirect
 * - JWT used for auth
 * - Cookies work with Next.js & Render
 */

import express, { NextFunction, Request, Response } from "express";
import passport from "./strategies/google.strategy";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import userRouter from "./routes/user.route";
import morgan from "morgan";
import globalError_handler from "./shared/utils/globalError-handler";
import questionRoute from "./routes/question.route";
import path from "path";
import { compressionMiddleware } from "./middlewares/compression.middleware";
import resultRouter from "./routes/result.route";
import noteRouter from "./routes/note.route";
import feedRouter from "./routes/feed.route";
import { cleanupUploadedFiles } from "./shared/utils/cleanupFileUpload";
import commentRouter from "./routes/comment.route";
import analyticsRouter from "./routes/analytics.route";
import liteMetricsRouter from "./matrices/liteMetricsExporter";

const app = express();

/* ------------------------- Middlewares ------------------------- */
app.set("trust proxy", 1);

app.use(compressionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://notementor.onrender.com",
  "https://notementor.vercel.app",
  "https://www.notementor.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Security + Logs
app.use(helmet());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Passport ONLY initializes (NO session)
app.use(passport.initialize());

/* --------------------------- Routes ---------------------------- */

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use(userRouter);
app.use(questionRoute);
app.use(resultRouter);
app.use(noteRouter);
app.use(feedRouter);
app.use(commentRouter);
app.use(analyticsRouter);
app.use(liteMetricsRouter);

/* --------------------------- 404 ---------------------------- */
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

/* --------------------- Aborted Upload Cleanup --------------------- */
app.use((req, res, next) => {
  req.on("aborted", () => {
    console.warn("⚠️ Request aborted — cleaning temp files");
    cleanupUploadedFiles((req as any).files);
  });
  next();
});

/* -------------------------- Error Handler -------------------------- */
app.use(globalError_handler);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled Error:", err);
  if (res.headersSent) return next(err);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message || err });
});

export default app;
