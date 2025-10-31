import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { IUserRequest } from "../types/express";


/**
 * Authentication middleware
 * Verifies JWT access token and attaches user info to req.user
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1️⃣ Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = tokenFromHeader || req.cookies?.accessToken;

    if (!token) {
      return HandleResponse.unauthorized(res, "Access token missing");
    }

    if (!process.env.JWT_ACCESS_TOKEN_KEY) {
      return HandleResponse.error(res, null, "JWT secret missing");
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY) as JwtPayload & {
      _id: string;
    };

    // 3️⃣ Attach safe user object to request
    const safeUser: IUserRequest = {
      _id: decoded._id,
    };

    req.user = safeUser;

    next();
  } catch (error: any) {
    console.error("❌ Authentication Error:", error);
    return HandleResponse.unauthorized(res, "Invalid or expired token");
  }
};