
//  Response Handler
import { Response } from "express";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode: number;
}

class HandleResponse {
  static success<T>(res: Response, data: T, message = "Success", statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = "Resource created") {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode: 201,
    };
    return res.status(201).json(response);
  }

  static error(res: Response, error: any, message = "Something went wrong", statusCode = 500) {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message = "Bad request", error?: any) {
    return this.error(res, error, message, 400);
  }

  static unauthorized(res: Response, message = "Unauthorized") {
    return this.error(res, null, message, 401);
  }

  static notFound(res: Response, message = "Not found") {
    return this.error(res, null, message, 404);
  }
}

export default HandleResponse;