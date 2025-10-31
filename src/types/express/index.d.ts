// src/types/express/index.d.ts
// Purpose: Safely extend Express.Request.user with your own IUserRequest type.

export interface IUserRequest {
  _id: string;
  // add more fields if needed
}

// Extend Express namespace globally
declare global {
  namespace Express {
    interface User extends IUserRequest {} // ✅ merge into existing passport type if it exists
  }
}

export {};
