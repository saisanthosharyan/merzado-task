import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware.js";
import User, { UserRole } from "../models/User.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const user = await User.findById(req.userId).select("role");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};