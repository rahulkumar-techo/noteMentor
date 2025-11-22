// Utility for generating, verifying, and managing short-lived OTP tokens using JWT

import jwt from "jsonwebtoken";
import { config } from "../../../config/env.config";
import { OtpModel } from "../../../models/otp.model";

class OtpToken {
  generateOtpToken(otp: string): string {
    return jwt.sign({ otp }, config.jwt.jwt_otp_secret_key, { expiresIn: "5m" });
  }

  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyOtp(email: string, enteredOtp: string): Promise<boolean> {
    try {
      const otpRecord = await OtpModel.findOne({ email });
      if (!otpRecord) return false;

      const decoded: any = jwt.verify(
        String(otpRecord.token),
        config.jwt.jwt_otp_secret_key
      );

      if (decoded.otp !== enteredOtp) return false;

      await OtpModel.deleteOne({ email });
      return true;
    } catch {
      return false;
    }
  }
}

export const otpToken = new OtpToken();
