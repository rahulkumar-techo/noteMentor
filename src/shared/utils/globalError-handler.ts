import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import { ZodError } from "zod";

interface CustomError extends Error {
  statusCode?: number;
}

const globalError_handler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Global Error:", err);

  let statusCode = 500;
  let message = "Internal Server Error";


  // ✅ Zod validation error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    return res.status(statusCode).json({
      success: false,
      message,
      errors:( err as any).errors, 
    });
  }
  // Handle Mongoose validation errors
  if (err instanceof Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(", ");
  }

  // Handle Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value: ${JSON.stringify(err.keyValue)}`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Custom errors
  if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message; // e.g., "File too large"
  }

  res.status(statusCode).json({ message });
};

export default globalError_handler;