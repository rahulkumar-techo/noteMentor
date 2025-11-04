
import attemptModel from "../models/attempt.model";
import questionModel from "../models/question.model";
import { resultValidationType } from "../validations/result.validation";
import mongoose from "mongoose";

export default class ResultService {
  async verifyAnswers(answers: resultValidationType[], userId?: string) {
    let totalScore = 0;
    const totalMax = answers.length;

    for (const ans of answers) {
      const { q_Id, answer } = ans;

      // 🧩 If q_Id looks like ObjectId → check DB
      if (mongoose.Types.ObjectId.isValid(q_Id)) {
        const question = await questionModel.findById(q_Id);

        if (!question) continue;

        if (question.type === "mcq" && question.mcq?.correctAnswer === answer) {
          totalScore += 1;
        }

        // Save attempt to DB
        await attemptModel.create({
          questionId: q_Id,
          userId,
          answers: { userAnswer: answer },
          score: question.mcq?.correctAnswer === answer ? 1 : 0,
          maxScore: 1,
        });
      } else {
        // 🧠 Skip DB check for AI-generated or temporary questions
        console.log("Skipping non-DB question:", q_Id);
      }
    }

    return {
      totalScore,
      totalMax,
      percentage: ((totalScore / totalMax) * 100).toFixed(2),
    };
  }
}
