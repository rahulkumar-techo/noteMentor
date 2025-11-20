/**
 * analytics.service.ts
 * -------------------------------------------------------
 * Analytics Matrix Generator
 * - Monthly user registrations
 * - Monthly notes created
 * - Returns clean matrix format
 * -------------------------------------------------------
 */


import NoteModel from "../models/note.model";
import { UserModel } from "../models/user.model";

export async function getAnalyticsMatrix(year: number) {
  try {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    // ---------------------------
    // Users Registered Per Month
    // ---------------------------
    const userStats = await UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // ---------------------------
    // Notes Created Per Month
    // ---------------------------
    const noteStats = await NoteModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // ---------------------------
    // Convert to matrix format
    // ---------------------------
    const matrix = Array.from({ length: 12 }).map((_, i) => ({
      month: i + 1,
      usersRegistered: 0,
      notesCreated: 0,
    }));

    userStats.forEach((u) => {
      matrix[u._id.month - 1].usersRegistered = u.count;
    });

    noteStats.forEach((n) => {
      matrix[n._id.month - 1].notesCreated = n.count;
    });

    return {
      success: true,
      year,
      matrix,
    };
  } catch (err: any) {
    throw new Error(err?.message || "Failed to generate analytics matrix");
  }
}
