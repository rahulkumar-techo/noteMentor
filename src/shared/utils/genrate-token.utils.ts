import jwt, { JwtPayload } from "jsonwebtoken";

import ms from "ms";
import { IUser } from "../../models/user.model";
import redis from "../../config/client-redis";
import { RefreshTokenModel } from "../../models/refreh.model";


/* --------------------- Payload & Token Interfaces --------------------- */
export interface IPayload {
  _id: string;
}

export interface ITokenResult {
  accessToken: string;
  refreshToken: string;
  accessTTL: number;    // seconds
  refreshTTL: number;   // seconds
}

/* --------------------- Token Generation --------------------- */
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

  const payload: IPayload = {
    _id: String(user._id)
  };

  // Token expiry
  const accessTokenExp = "15m"; // Access token: 15 minutes
  const refreshTokenExp = "7d"; // Refresh token: 7 days

  const accessTTL = Math.floor(ms(accessTokenExp) / 1000);
  const refreshTTL = Math.floor(ms(refreshTokenExp) / 1000);

  // Generate JWT tokens
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_KEY, { expiresIn: accessTTL });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_KEY, { expiresIn: refreshTTL });

  // Store refresh token: Redis + MongoDB
  if (oldRefreshToken) await redis.del(`refresh:${oldRefreshToken}`);
  await RefreshTokenModel.findOneAndDelete({ userId: payload._id });
  await redis.set(`refresh:${refreshToken}`, String(user._id), "EX", refreshTTL);
  await RefreshTokenModel.create({ userId: payload._id, token: refreshToken, deviceId, ip,expiresAt:refreshTTL,user:payload?._id });

  return { accessToken, refreshToken, accessTTL, refreshTTL };
};

/* --------------------- Token Expiry Check --------------------- */
export const isTokenExp = (token: string): boolean => {
  if (!token) return true;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY!) as JwtPayload;
    const currentTime = Math.floor(Date.now() / 1000);
    return (decoded.exp ?? 0) < currentTime;
  } catch {
    return true; // treat invalid or expired token as expired
  }
};