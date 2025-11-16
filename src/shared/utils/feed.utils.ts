/**
 * Description:
 * Utility functions for feed – normalization & ranking logic.
 */

export function normalize(item: any, type: string) {
  switch (type) {
    case "note":
      return {
        id: item._id,
        type: "note",
        createdAt: item.createdAt,
        priorityBase: 3,
        payload: {
          noteId:item?._id,
          title: item.title,
          excerpt: item.descriptions?.slice(0, 240),
          userId: item.userId,
          subjects: item.subjects?.length ? item.subjects : ["General"],
          stats: item.stats,
          thumbnail:item?.thumbnail?.secure_url||""
        },
      };

    case "question":
      return {
        id: item._id,
        type: "question",
        createdAt: item.createdAt,
        priorityBase: 2,
        payload: {
          title: item.title,
          content: item.content,
          difficulty: item.difficulty,
          stats: item.stats,
        },
      };

    case "ad":
      return {
        id: item._id,
        type: "ad",
        createdAt: item.createdAt,
        priorityBase: 8 + (item.budgetPriority || 0),
        payload: {
          title: item.title,
          body: item.body,
          mediaUrl: item.mediaUrl,
          targetSubjects: item.targetSubjects,
        },
      };

    default:
      return null;
  }
}

export function computeRankScore(feedObj: any, userContext: any = {}) {
  const now = Date.now();

  const ageHours =
    (now - new Date(feedObj.createdAt).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 10 - ageHours);

  const stats = feedObj.payload?.stats || {};
  const engagement =
    (stats.likes?.length || 0) * 2 +
    (stats.comments?.length || 0) * 3 +
    (stats.views?.length || 0) * 0.1;

  let subjectBoost = 0;
  if (userContext.topSubjects && feedObj.payload?.subjects) {
    const common = feedObj.payload.subjects.filter((s: string) =>
      userContext.topSubjects.includes(s)
    ).length;

    subjectBoost = Math.min(5, common * 2);
  }

  const base = feedObj.priorityBase || 1;

  const score =
    base * 5 + recencyScore * 2 + engagement * 0.5 + subjectBoost * 2;

  return Math.round(score * 100) / 100;
}
