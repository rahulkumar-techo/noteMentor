import express from "express"
import passport from "../strategies/google.strategy"
import { IUserRequest } from "../types/express";
import setTokenCookies from "../shared/utils/set-cookies";
import { generateTokens } from "../shared/utils/genrate-token.utils";
import redis from "../config/client-redis";
import { Types } from "mongoose";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import { userController } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

// /api/user/update/academic, /update/personalization, /update/settings?
const userRouter = express()
// Routes
userRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

userRouter.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", async (err: any, user: IUserRequest) => {
      if (err || !user) {
        return res.redirect("http://localhost:3000?error=oauth_failed");
      }
      const refactorUser = {
        _id: new Types.ObjectId(user?._id) ,
      }
      const oldRefreshToken = req?.cookies?.refreshToken;
      const { accessToken, refreshToken, accessTTL, refreshTTL } = await generateTokens({ user: refactorUser,oldRefreshToken });
      setTokenCookies({ res, accessToken, refreshToken, accessTTL, refreshTTL });
    //   await redis.set(`session:${user._id}`, JSON.stringify(user), "EX", accessTTL);
      res.redirect("/");
    })(req, res, next);
  }
);

userRouter.get("/me",autoRefreshAccessToken,authenticate,(req,res)=>{
   return res.status(201).json({
        success:true,
        user:req?.user
    })
})
userRouter.post("/register",userController.registerUser)
userRouter.post("/otp-verification",userController.registerVerification)
userRouter.post("/login",userController.login)

// Profile
userRouter.put("/api/user/update",upload.single("avatar"),userController.updateProfile)


export default userRouter