// src/types/express/index.d.ts
// Purpose: Extend Express.User (used by Passport) to include custom fields for your app

export interface IUserRequest {
  _id: string;
  email?: string;
  fullname?: string;
  picture?: string;
  isVerified?: boolean;
  provider?:"local"|"google"
}

// Global augmentation for Express
declare global {
  namespace Express {
    // Merge your IUserRequest fields into Passport's Express.User
    interface User extends IUserRequest {}
  }
}

export {};
