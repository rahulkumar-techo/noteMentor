/**
 * user.interface.ts
 * ------------------------------------------------------
 * TypeScript interfaces for NoteGenie user data models.
 * Defines academic, personalization, and device structures.
 */

import { Document, Types } from "mongoose";

// 🎓 Academic Info
export interface IUserAcademic {
  userId: string;
  board: string;
  classOrYear: string;
  subjects: string[];
  languagePreference: "english" | "hindi" | "hinglish";
  examGoal?: string;
}

// 💡 Personalization Info
export interface IUserPersonalization {
  userId: string;
  learningSpeed: "fast" | "moderate" | "slow";
  goalType: "score_improvement" | "concept_clarity" | "revision";
  focusDuration: number;
  prevPerformance?: { subject: string; accuracy: number }[];
  noteUploadType: "handwritten" | "typed" | "mixed";
}

// ⚙️ Device / App Settings
export interface IUserDevice {
  userId: string;
  deviceType: "mobile" | "tablet" | "pc";
  offlineMode: boolean;
  storageSync: "local" | "cloud";
  theme: "light" | "dark" | "auto";
}

export interface cloudinaryFile {
  secure_url: string,
  public_id: string,
  bytes: string,
}

// 👤 Main User
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  avatar: cloudinaryFile;
  fullname: string;
  password:string;
  email: string;
  social_auth?: {
    googleId?: string;
  };
  isVerified: boolean;
  isProfileComplete: boolean;
  role: "school" | "college" | "aspirant" | "teacher" | "admin" | "guest";
  provider: "google" | "local";
  academic?: IUserAcademic;
  personalization?: IUserPersonalization;
  settings?: IUserDevice;
    comparePassword(candidatePassword: string): Promise<boolean>;
  otp?: {
    token: string;
    createdAt: Date;
  };
}
