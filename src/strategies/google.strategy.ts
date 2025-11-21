/**
 * Google OAuth Strategy (JWT version)
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.model";
import { config } from "../config/env.config";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.google_clientId,
      clientSecret: config.google.google_secret,
      callbackURL: "https://notementor.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({
          "social_auth.googleId": profile.id,
        });

        if (!user) {
          const username = profile.displayName + "_" + Date.now();

          user = await UserModel.create({
            username,
            fullname: profile.displayName,
            email: profile.emails?.[0].value,
            social_auth: { googleId: profile.id },
            provider: "google",
            avatar: {
              secure_url: profile?._json?.picture || "",
            },
            isVerified: true,
          });
        }

        return done(null, {
          _id: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
          provider: "google",
        });
      } catch (err) {
        console.error("❌ Google Strategy Error:", err);
        return done(err, undefined);
      }
    }
  )
);

export default passport;
