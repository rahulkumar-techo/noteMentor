
/**
 * @file otp.model.ts
 * @description Defines the OTP model for temporary verification tokens.
 * The OTP document automatically expires after 5 minutes using MongoDB TTL indexes.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
    email: string; // Or userId if you want to link to users
    token: string;
    createdAt: Date;
}

// OTP Schema with TTL
const otpSchema = new Schema<IOtp>({
    email: {
        type: String,
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // ⏳ 300 seconds = 5 minutes
    },
});

export const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);
