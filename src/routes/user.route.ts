import express, { Request, Response } from "express"
import passport from "../strategies/google.strategy"
import { IUserRequest } from "../types/express";
import setTokenCookies from "../shared/utils/set-cookies";
import { generateTokens } from "../shared/utils/genrate-token.utils";
import redis from "../config/client-redis";
import { Types } from "mongoose";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import { userController } from "../controllers/user.controller";
// import { upload } from "../middlewares/multer.middleware";
import { academicController } from "../controllers/academic.controller";
import { personalizationController } from "../controllers/personalization.controller";
import { deviceController } from "../controllers/device.controller";
import { RefreshTokenModel } from "../models/refreh.model";
import { requireRole } from "../middlewares/requireRole.middleware";

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProd 
  ? "https://note-mentor-frontend.vercel.app/" 
  : "http://localhost:3000";

// /api/user/update/academic, /update/personalization, /update/settings?
const userRouter = express()
// Routes
userRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Redirect user to Google
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}?error=oauth_failed`,
    session: false,
  }),
  async (req: any, res) => {
    try {
      console.log("🔥 GOOGLE SUCCESS CALLBACK HIT");
      console.log("🔥 USER FROM PASSPORT:", req.user);

      const user = req.user;

      const oldRefreshToken = req.cookies?.refreshToken;

      // generate new tokens
      const { accessToken, refreshToken, accessTTL, refreshTTL } =
        await generateTokens({
          user: { _id: user._id },
          oldRefreshToken,
        });

      // set cookies
      setTokenCookies({
        res,
        accessToken,
        refreshToken,
        accessTTL,
        refreshTTL,
      });

      // redirect to frontend
      return res.redirect(FRONTEND_URL);

    } catch (err) {
      console.error("OAuth error:", err);
      return res.redirect(`${FRONTEND_URL}?error=server_error`);
    }
  }
);

userRouter.get("/api/me", autoRefreshAccessToken, authenticate, userController.get_userProfile)
userRouter.post("/api/register", userController.registerUser)
userRouter.post("/api/otp-verification", userController.registerVerification)
userRouter.post("/api/login", userController.login)

// Profile
// userRouter.put("/api/user/update-profile",autoRefreshAccessToken,authenticate,upload.single("avatar"),userController.updateProfile)
userRouter.get("/api/get-profile", autoRefreshAccessToken, authenticate, userController.get_userProfile)

// academic 
userRouter.put("/api/user/academic", autoRefreshAccessToken, authenticate, academicController.editAcademic)

// Personalization 
userRouter.get("/api/user/personalization", autoRefreshAccessToken, authenticate, personalizationController.get);
userRouter.put("/api/user/personalization", autoRefreshAccessToken, authenticate, personalizationController.update);

// device settings
userRouter.put("/api/user/settings", autoRefreshAccessToken, authenticate, deviceController.update)
userRouter.get("/api/user/settings", autoRefreshAccessToken, authenticate, deviceController.get)
// complete profile
userRouter.put("/api/user/complete-profile", autoRefreshAccessToken, authenticate, userController.complete_profile)

userRouter.post(
  "/logout",
  autoRefreshAccessToken,
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req?.cookies?.refreshToken;
      await redis.del(`refresh:${refreshToken}`);
      await RefreshTokenModel.deleteOne({ token: refreshToken })
      // 🧹 Clear authentication cookies
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true, // set to false in dev if not using HTTPS
        sameSite: "none", // for cross-origin cookies
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Error while logging out.",
      });
    }
  }
);

export default userRouter