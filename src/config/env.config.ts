/**
 * Loads environment variables from .env file
 * and exports them as a config object.
 */
import dotenv from "dotenv";
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI!,
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  openaiKey: process.env.OPENAI_API_KEY!,
  redisUrl: process.env.REDIS_URL!,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  frontendUrl: process.env.FRONTEND_URL!,
  baseUrl:process.env.BASE_URL!,
  redis:{
    redis_uri:process.env.REDIS_URI||""
  },
  google:{
    google_clientId:process.env.GOOGLE_CLIENT_ID!,
    google_secret:process.env.GOOGLE_SECRET_ID!,
    google_callback:process.env.CALLBACK_URL!
  }
};
