/**
 * user.model.ts
 * ------------------------------------------------------
 * Mongoose schema & model for NoteGenie users.
 * Supports modular sub-objects (academic, personalization, device).
 */

import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

// 🎓 Embedded Subschemas (for nesting in main user schema)
const AcademicSchema = new Schema(
  {
    board: { type: String },
    classOrYear: { type: String },
    subjects: [{ type: String }],
    languagePreference: {
      type: String,
      enum: ["english", "hindi", "hinglish"],
      default: "english",
    },
    examGoal: { type: String },
  },
  { _id: false }
);

const PersonalizationSchema = new Schema(
  {
    learningSpeed: {
      type: String,
      enum: ["fast", "moderate", "slow"],
      default: "moderate",
    },
    goalType: {
      type: String,
      enum: ["score_improvement", "concept_clarity", "revision"],
      default: "concept_clarity",
    },
    focusDuration: { type: Number, default: 25 },
    prevPerformance: [
      {
        subject: String,
        accuracy: Number,
      },
    ],
    noteUploadType: {
      type: String,
      enum: ["handwritten", "typed", "mixed"],
      default: "mixed",
    },
  },
  { _id: false }
);

const DeviceSchema = new Schema(
  {
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "pc"],
      default: "mobile",
    },
    offlineMode: { type: Boolean, default: false },
    storageSync: {
      type: String,
      enum: ["local", "cloud"],
      default: "cloud",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },
  },
  { _id: false }
);

// 👤 Main User Schema
const userSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, required: [true, "username is required"] },
    avatar: { 
      secure_url:{type:String,default:""},
      public_id:{type:String,default:""},
      bytes:{type:String,default:""}
    },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    social_auth: {
      googleId: { type: String, default: null },
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      required: true,
    },
    isVerified: { type: Boolean ,default:false},
    isProfileComplete: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["school", "college", "aspirant", "teacher", "admin", "guest"],
      required: true,
      default: "guest"
    },
    academic: AcademicSchema,
    personalization: PersonalizationSchema,
    settings: DeviceSchema,
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
