
/**
 * Controller for managing personalization preferences
 * Uses PersonalizationService for business logic
 */

import { Request, Response } from "express";
import { personalizationService } from "../services/personalization.service";

class PersonalizationController {
  async update(req: Request, res: Response) {
    try {
      const userId = req.user?._id; // assumes auth middleware sets req.user
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const updatedUser = await personalizationService.updatePersonalization(userId, req.body);

      res.status(200).json({
        message: "Personalization preferences updated successfully",
        personalization: updatedUser.personalization,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update personalization" });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const personalization = await personalizationService.getPersonalization(userId);

      res.status(200).json({ personalization });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to fetch personalization" });
    }
  }
}

export const personalizationController = new PersonalizationController();
