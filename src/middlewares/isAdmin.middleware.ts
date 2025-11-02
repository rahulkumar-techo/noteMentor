/**
 * 🔐 Auth Middleware (JWT + Role-based Access)
 * - Verifies token
 * - Attaches user info to req.user
 * - Supports role-based restriction (admin/user)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config";
import { UserModel } from "../models/user.model";

// Middleware factory to restrict by role
export function auth(requiredRoles: ("school" | "college" | "aspirant" | "teacher" | "admin" | "guest")[] = []) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req?.user?._id;

            const user = await UserModel.findOne({ _id: userId })
            // if()
            // ensure user exists
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // extract role with a typed assertion so TS knows the possible role values
            const userRole = (user as unknown as { role?: "school" | "college" | "aspirant" | "teacher" | "admin" | "guest" }).role;

            if (!userRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            if (requiredRoles.length && !requiredRoles.includes(userRole)) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            next();
        } catch (error: any) {
            console.error("❌ [AuthMiddleware Error]:", error.message);
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
    };
}
