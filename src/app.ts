

import express, { NextFunction, Request, Response } from "express";
import passport from "./strategies/google.strategy";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import userRouter from "./routes/user.route";
import questionRoute from "./routes/question.route";
import resultRouter from "./routes/result.route";
import noteRouter from "./routes/note.route";
import feedRouter from "./routes/feed.route";
import commentRouter from "./routes/comment.route";
import analyticsRouter from "./routes/analytics.route";
import liteMetricsRouter from "./matrices/liteMetricsExporter";

import globalError_handler from "./shared/ai/utils/globalError-handler";
import { compressionMiddleware } from "./middlewares/compression.middleware";
import { cleanupUploadedFiles } from "./shared/ai/utils/cleanupFileUpload";

const app = express();

/* ------------------------- Core Middlewares ------------------------- */

app.set("trust proxy", 1);
app.use(compressionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------------- CORS Setup ------------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "https://notementor.onrender.com",
  "https://notementor.vercel.app",
  "https://www.notementor.vercel.app",
  "https://note-mentor-frontend.vercel.app/"
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ------------------------- Security + Static ------------------------- */

app.use(helmet());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

/* ------------------------- Passport OAuth ------------------------- */

app.use(passport.initialize());

/* ---------------------------- Routes ---------------------------- */

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

/* ---------------------------- 404 Handler ---------------------------- */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ------------------ Cleanup Aborted Uploads ------------------ */

app.use((req, res, next) => {
  req.on("aborted", () => cleanupUploadedFiles((req as any).files));
  next();
});

/* ----------------------- Global Error Handler ----------------------- */

app.use(globalError_handler);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled Error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message || err,
  });
});

export default app;
