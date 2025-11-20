import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req as any).user?._id;

      if (!id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Login required",
        });
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient role",
        });
      }

      return next();
    } catch (err) {
      console.error("Role Middleware Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
}
