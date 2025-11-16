// Service layer: Fetches data from DB, merges, ranks, interleaves, and returns feed.

import AdModel from "../models/ad.model";
import NoteModel from "../models/note.model";
import QuestionModel from "../models/question.model";
import { computeRankScore, normalize } from "../shared/utils/feed.utils";

interface FeedItem {
  id: string;
  type: "note" | "question" | "ad";
  createdAt: Date;
  priorityBase: number;
  payload: any;
  rankScore?: number;
}

export class FeedService {
  async getUnifiedFeed(limit: number, userId: string) {
    const userContext = {
      topSubjects: ["Math", "Physics"],
    };

    // ------------------------------
    // 1) FETCH DATA
    // ------------------------------
    const [notes, questions, ads] = await Promise.all([
      NoteModel.find({
        $or: [
          { "settings.visibility": "public" },
          { authorId:userId }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      QuestionModel.find({})
        .sort({ createdAt: -1 })
        .limit(40)
        .lean(),

      AdModel.find({
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
      })
        .limit(20)
        .lean(),
    ]);

    // ------------------------------
    // 2) NORMALIZE
    // ------------------------------
    const feedCandidates: FeedItem[] = [
      ...notes.map(n => normalize(n, "note")),
      ...questions.map(q => normalize(q, "question")),
      ...ads.map(a => normalize(a, "ad")),
    ].filter(Boolean) as FeedItem[];

    // ------------------------------
    // 3) RANK EACH CANDIDATE
    // ------------------------------
    feedCandidates.forEach(item => {
      item.rankScore = computeRankScore(item, userContext);
    });

    // ------------------------------
    // 4) BUCKET BASED MIXING (LinkedIn style)
    // ------------------------------
    const notesBucket = feedCandidates
      .filter(x => x.type === "note")
      .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));

    const questionsBucket = feedCandidates
      .filter(x => x.type === "question")
      .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));

    const adsBucket = feedCandidates
      .filter(x => x.type === "ad")
      .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));

    // ------------------------------
    // 5) MIX: Round-Robin
    // ------------------------------
    const finalFeed: FeedItem[] = [];
    let i = 0;

    while (finalFeed.length < limit) {
      // Add NOTE
      if (notesBucket[i]) finalFeed.push(notesBucket[i]);

      // Add QUESTION
      if (questionsBucket[i]) finalFeed.push(questionsBucket[i]);

      // Add AD (every 2 rounds)
      const adIndex = Math.floor(i / 2);
      if (i % 2 === 0 && adsBucket[adIndex]) {
        finalFeed.push(adsBucket[adIndex]);
      }

      i++;

      if (!notesBucket[i] && !questionsBucket[i] && !adsBucket[Math.floor(i / 2)]) {
        break;
      }
    }

    // Limit output
    const mixedFeed = finalFeed.slice(0, limit);

    // ------------------------------
    // 6) RETURN FEED TO CLIENT
    // ------------------------------
    return mixedFeed.map(it => ({
      id: it.id,
      type: it.type,
      createdAt: it.createdAt,
      rankScore: it.rankScore,
      payload: it.payload,
    }));
  }
}

export const feedService = new FeedService();
