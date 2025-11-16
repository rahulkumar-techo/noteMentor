

import { Request, Response } from "express";
import { feedService } from "../services/feed.service";

export class FeedController {
  async getFeed(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = (req.user?._id as string) || "";

      const feed = await feedService.getUnifiedFeed(limit, userId);

      return res.status(200).json({
        success: true,
        feed,
        limit,
      });
    } catch (err: any) {
      console.error("Feed error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch feed",
      });
    }
  }
}

export const feedController = new FeedController();
