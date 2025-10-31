import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
  revoked?: boolean;
  blacklist:boolean
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    ip: { type: String },
    userAgent: { type: String },
    revoked: { type: Boolean, default: false },
    blacklist:Boolean
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired tokens

export const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
