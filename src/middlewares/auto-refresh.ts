import { NextFunction, Request, Response } from "express";
import { isTokenExp } from "../shared/utils/genrate-token.utils";
import HandleResponse from "../shared/utils/handleResponse.utils";
import RefreshAccessToken from "../shared/utils/refreh-access-token.utils";
import setTokenCookies from "../shared/utils/set-cookies";


/**
 * Middleware to auto-refresh access token if it's expired or missing.
 * - Checks if accessToken exists and is valid
 * - If expired or missing, uses refreshToken to get new accessToken
 * - Attaches updated accessToken to Authorization header
 */
const autoRefreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accessToken = req.cookies?.accessToken;
    // if accessToken  exists and not expired then just pass
    if (accessToken && !isTokenExp(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
      return next();
    }

    const refreshToken = req.cookies?.refreshToken;
    console.log(refreshToken)
    if (!refreshToken) {
      return HandleResponse.unauthorized(res, "Refresh token missing");
    }

    // Refresh tokens
    const tokens = await RefreshAccessToken({req,oldRefreshToken:refreshToken});
    if (!tokens) {
      return HandleResponse.unauthorized(res, "Invalid or expired refresh token");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken, accessTTL, refreshTTL } = tokens;

    // Set cookies
    setTokenCookies({ res, accessToken: newAccessToken, refreshToken: newRefreshToken, accessTTL, refreshTTL });

    req.headers["authorization"] = `Bearer ${newAccessToken}`;

    next();
  } catch (error: any) {
    console.error("Auto-refresh error:", error);
    if (!res.headersSent) {
      return HandleResponse.error(res, error.message || "Something went wrong");
    }
  }
};


export default autoRefreshAccessToken;