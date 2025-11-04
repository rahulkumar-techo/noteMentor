/**
 * Google OAuth Passport Configuration
 * Links user login with Google and integrates with your existing JWT system
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
          const username = profile?.username || profile?.displayName + (Math.floor(Date.now()));
          user = await UserModel.create({
            username,
            fullname: profile.displayName,
            email: profile.emails?.[0].value,
            social_auth: { googleId: profile.id },
            provider: "google",
            avatar: {
              secure_url: profile?._json?.picture||""
            },
            isVerified: profile?._json?.email_verified || true
          });
        }

        // Return a lightweight user object to session or JWT
        done(null, {
          _id: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
          provider: "google",
        });
      } catch (err) {
        console.error("❌ Google Strategy Error:", err);
        done(err, undefined);
      }
    }
  )
);

// Serialize + Deserialize (for session compatibility)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

export default passport;
