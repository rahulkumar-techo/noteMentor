/**
 * @class UserService
 * @description Handles user-related operations like profile update, including Cloudinary avatar management.
 */

import { Request, Response } from "express";
import { IUser, cloudinaryFile } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { FileManger } from "../shared/utils/FileManger";
import { LoginValidationInput, RegisterInput, RegisterVerificationInput } from "../validations/user.validation";
import { helperService } from "./helper.service";
import HandleResponse from "../shared/utils/handleResponse.utils";
import { otpToken } from "../shared/utils/otp-token.utils";
import { OtpModel } from "../models/otp.model";
import { Types } from "mongoose";
import { generateTokens } from "../shared/utils/genrate-token.utils";
import setTokenCookies from "../shared/utils/set-cookies";
import bcrypt from "bcryptjs"

interface IUpdateProfile {
  username: string;
  fullname: string;
  avatar?: Express.Multer.File;
}

class UserService {
  private fileManager = new FileManger();
  async updateProfile(
    userId: string,
    { username, fullname, avatar }: IUpdateProfile
  ): Promise<Partial<IUser> | null> {
    try {
      if (!username || !fullname) {
        throw new Error("Missing required fields: username or fullname");
      }

      const result = await helperService.checkAndGenUsername(username)

      const user = await UserModel.findById(userId).select("avatar username fullname");
      if (!user) throw new Error("User not found");

      let updatedAvatar: cloudinaryFile | undefined;

      // If new avatar is uploaded, handle Cloudinary update
      if (avatar) {
        try {
          const result = await this.fileManager.updateFile(
            user.avatar?.public_id || "",
            avatar,
            `/noteGenie/avatar/${userId}`
          );

          updatedAvatar = {
            secure_url: result.data.secure_url,
            public_id: result.data.public_id,
            bytes: result.data.bytes,
          };
        } catch (error: any) {
          console.error(`⚠️ Cloudinary update error: ${error.message}`);
        }
      }

      // Update MongoDB user document
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          username: result,
          fullname,
          ...(updatedAvatar && { avatar: updatedAvatar }),
        },
        { new: true, select: "username fullname avatar" }
      );

      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return null;
    }
  }
  // ------------- Register User ---------------------
  async register(data: RegisterInput): Promise<Partial<IUser> | null> {
    try {
      const existingUser = await UserModel.findOne({ email: data.email });

      if (existingUser) {
        throw new Error("User already registered (maybe with Google)");
      }
      const otp = otpToken.generateOtpCode()
      const token = otpToken.generateOtpToken(otp);
      if (!token) {
        throw new Error("falied to generate token")
      }
      const saltRounds = 10;
      const hash = await bcrypt.hash(data.password, saltRounds);

      const newUser = await UserModel.create({
        fullname: data.fullname,
        email: data.email,
        username: data.username,
        password: hash,
        provider: "local",
      });

      await OtpModel.create({
        email: data.email,
        token,
        createdAt: Date.now()
      })
      // 🚀 Placeholder: send OTP via email
      console.log(`✅ OTP for ${data.email}: ${otp}`);

      return {
        _id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        username: newUser.username,
      };
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return null
    }
  }

  // Verifies OTP and updates user verification status

  async registerVerification({ otp, email }: RegisterVerificationInput) {
    try {
      const isOtpVerified = await otpToken.verifyOtp(email, otp);
      if (!isOtpVerified) throw new Error("OTP not verified or expired");

      await UserModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );

      return { success: true, message: "User verified successfully" };
    } catch (error: any) {
      console.error("OTP verification failed:", error.message);
      return { success: false, message: error.message };
    }
  }
  // login
async loginByEmailAndPassword(oldRefreshToken:string,{ email, password }: { email: string; password: string }) {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Not a registered user");

    if (!user.isVerified) throw new Error("User not verified");

    const isMatched = await bcrypt.compare(password,user?.password);
    if (!isMatched) throw new Error("Incorrect password");

    const refactorUser = { _id: user._id };
    const { accessToken, refreshToken, accessTTL, refreshTTL } = await generateTokens({ user: refactorUser,oldRefreshToken });

    console.log("✅ Tokens generated successfully for", email);

    return {accessToken, refreshToken, accessTTL, refreshTTL  };
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    throw new Error(error.message);
  }
}



}

export default new UserService();
