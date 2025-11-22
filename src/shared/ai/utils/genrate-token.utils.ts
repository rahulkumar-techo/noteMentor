/**
 * Utility to generate access & refresh tokens for users.
 * - Deletes old refresh token (from Redis + DB)
 * - Creates new tokens (JWT + Redis + Mongo)
 * - Returns both tokens with expiry info
 */

import jwt, { JwtPayload } from "jsonwebtoken";
import ms from "ms";
import redis from "../../../config/client-redis";
import { RefreshTokenModel } from "../../../models/refreh.model";
import { IUser } from "../../../interfaces/user.interface";

export interface IPayload {
  _id: string;
}

export interface ITokenResult {
  accessToken: string;
  refreshToken: string;
  accessTTL: number;
  refreshTTL: number;
}

type TGenerateTokens = {
  user: Partial<IUser>;
  oldRefreshToken?: string;
  deviceId?: string;
  ip?: string;
};

export const generateTokens = async ({
  user,
  oldRefreshToken,
  deviceId,
  ip,
}: TGenerateTokens): Promise<ITokenResult> => {
  if (!process.env.JWT_ACCESS_TOKEN_KEY || !process.env.JWT_REFRESH_TOKEN_KEY) {
    throw new Error("JWT secret keys are missing in environment variables");
  }

  const payload: IPayload = { _id: String(user._id) };

  // ⏳ Token lifetimes
  const accessTTL = Math.floor(ms("15m") / 1000);
  const refreshTTL = Math.floor(ms("7d") / 1000);

  // 🎫 Generate JWT tokens
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_KEY, { expiresIn: accessTTL });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_KEY, { expiresIn: refreshTTL });

  try {
    // Remove old token (if exists)
    if (oldRefreshToken) {
      await Promise.allSettled([
        redis.del(`refresh:${oldRefreshToken}`),
        RefreshTokenModel.findOneAndDelete({ token: oldRefreshToken }).exec(),
      ]);
      console.log(`🗑️ Old refresh token deleted for user ${payload._id}`);
    }

    // 💾 2. Store new refresh token in Redis + Mongo
    await Promise.all([
      redis.set(`refresh:${refreshToken}`, String(user._id), "EX", refreshTTL),
      RefreshTokenModel.create({
        user: payload._id,
        token: refreshToken,
        deviceId,
        ip,
        expiresAt: new Date(Date.now() + refreshTTL * 1000),
      }),
    ]);

    console.log(`✅ New refresh token created for user ${payload._id}`);
  } catch (err) {
    console.error("❌ Token creation error:", err);
  }

  // 🚀 Return tokens immediately
  return { accessToken, refreshToken, accessTTL, refreshTTL };
};

/* --------------------- Token Expiry Check --------------------- */
export const isTokenExp = (token: string): boolean => {
  if (!token) return true;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY!) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    return (decoded.exp ?? 0) < now;
  } catch {
    return true;
  }
};
