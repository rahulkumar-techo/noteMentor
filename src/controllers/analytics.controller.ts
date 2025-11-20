

import { Request, Response } from "express";
import { getAnalyticsMatrix } from "../services/analytics.service";

export async function fetchAnalytics(req: Request, res: Response) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await getAnalyticsMatrix(year);

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
}
