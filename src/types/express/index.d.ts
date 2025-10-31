// src/types/express/index.d.ts
export interface IUserRequest {
  _id: string;
  email?: string;
  fullname?: string;
  provider?: "google" | "local"; // identify login type
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserRequest;
    }
  }
}

export {};
