import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "./strategies/google.strategy";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import userRouter from "./routes/user.route";
import morgan from "morgan"
import globalError_handler from "./shared/utils/globalError-handler";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

// Session is required for Passport OAuth to maintain state
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


// ---------------- Root Routes ----------------
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});
// ---------------- Routes ----------------
app.use(userRouter)

// ---------------- 404 Handler ----------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use(globalError_handler)

// ---------------- Fallback Error Catcher ----------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled Error:", err);
  if (res.headersSent) return next(err);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message || err });
});
export default app;
