import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateTokens, IPayload, ITokenResult } from "./genrate-token.utils";
import { RefreshTokenModel } from "../../../models/refreh.model"
import { UserModel } from "../../../models/user.model";


interface IRefreshAccessToken {
  req: Request,
  oldRefreshToken: string
}
const RefreshAccessToken = async (
  { req, oldRefreshToken }: IRefreshAccessToken
): Promise<ITokenResult | null> => {
  try {
    if (!oldRefreshToken) return null;

    if (!process.env.JWT_REFRESH_TOKEN_KEY) throw new Error("JWT secret missing");
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_TOKEN_KEY) as IPayload;
    if (!decoded) return null;
    
    // Additional work like check blacklist etc 
    const storedToken = await RefreshTokenModel.findOne({ user: decoded?._id });
    if (!storedToken || storedToken.blacklist) return null;
    const user = await UserModel.findById(decoded._id);
    if (!user) return null;

    return await generateTokens({ user, oldRefreshToken });
  } catch (error) {
    console.error("❌ Refresh Token Error:", error);
    return null;
  }
};


export default RefreshAccessToken;