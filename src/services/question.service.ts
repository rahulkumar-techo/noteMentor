/**
 * Question Service (Optimized for Fast AI + Background Save)
 * ---------------------------------------------------------
 * - Uses Gemini AI to generate questions
 * - Returns AI output instantly to user
 * - Saves results to MongoDB asynchronously using process.nextTick()
 * - Automatically adapts schema fields for MCQ / Short / Long types
 */

import questionModel from "../models/question.model";
import { generateQuestions } from "../shared/ai/gemini";
import { attemptQuestionValidationType, QuestionValidationType } from "../validations/question.validation";

class QuestionService {
  /**
   * Generate AI-based questions and store asynchronously
   */
  async createQuestions(userId: string, data: QuestionValidationType) {
    try {
      // 🧠 1️⃣ Generate questions from Gemini
      const aiResults = await generateQuestions(data);

      if (!Array.isArray(aiResults) || aiResults.length === 0) {
        throw new Error("AI returned no valid questions.");
      }

      // 🧩 2️⃣ Format for DB schema (supporting mcq, short, long)
// 🧩 2️⃣ Format for DB schema (supporting mcq, short, long)
const formattedQuestions = aiResults.map((q: any, index: number) => {
  const baseData = {
    creatorId: userId,
    question: q.question || `Question ${index + 1}`,
    explanation: q.explanation || "",
    topic: data.topic || "general",
    difficulty: data.difficulty || "medium",
    type: data.questionType || "mcq",
    attempts: [],
    attemptsCount: 0,
    isAI: true,
    language: data.language || "English",
  };

  switch (data.questionType) {
    case "mcq":
      // 🧠 Normalize options: ensure it's always [{ text: "..." }]
      const options =
        Array.isArray(q.options)
          ? q.options.map((opt: any) =>
              typeof opt === "string" ? { text: opt } : { text: opt.text || "" }
            )
          : [];

      return {
        ...baseData,
        mcq: {
          options,
          correctAnswer:
            typeof q.correctAnswer === "string"
              ? q.correctAnswer
              : q.correctAnswer?.text || "",
        },
      };

    case "short":
      return {
        ...baseData,
        short: { expectedAnswer: q.expectedAnswer || "" },
      };

    case "long":
      return {
        ...baseData,
        long: {
          expectedAnswer: q.expectedAnswer || "",
          wordLimit: q.wordLimit || 200,
        },
      };

    default:
      return baseData;
  }
});


      // ⚙️ 3️⃣ Save to DB asynchronously (non-blocking)
      process.nextTick(async () => {
        try {
          await questionModel.insertMany(formattedQuestions);
          console.log(
            `✅ [Background Save] ${formattedQuestions.length} questions saved for user ${userId}`
          );
        } catch (dbErr: any) {
          console.error("❌ [DB Save Error]:", dbErr.message);
        }
      });

      // 🚀 4️⃣ Instant Response to User
      return {
        success: true,
        message: "AI questions generated successfully",
        info: "Saving to database in background...",
        questions: aiResults,
      };
    } catch (error: any) {
      console.error("❌ [AI Generation Error]:", error.message);
      return {
        success: false,
        message: "AI question generation failed",
        error: error.message,
      };
    }
  }

  // ✅ Get all questions created by a specific user
  async getQuestions(userId: string) {
    try {
      // Fetch all questions where creatorId matches
      const result = await questionModel.find({ creatorId: userId }).lean();

      // If no questions found, return empty array
      if (!result || result.length === 0) {
        return { message: "No questions found for this user", data: [] };
      }

      return {
        message: "User questions fetched successfully",
        count: result.length,
        data: result,
      };
    } catch (error: any) {
      console.error("❌ [GetQuestions Error]:", error.message);
      return { error: "Failed to fetch user questions" };
    }
  }

  // ✅ Delete question with ownership check
  async deleteQuestion({ questionId, userId }: { questionId: string; userId: string }) {
    try {
      // 🔍 Find question by both ID and creator
      const question = await questionModel.findOne({ _id: questionId, creatorId: userId }).lean();

      if (!question) {
        throw new Error("Question not found or you don't have permission to delete it.");
      }

      // 🗑️ Delete question
      await questionModel.findByIdAndDelete(questionId);

      return {
        success: true,
        message: "Question deleted successfully",
        deletedId: questionId,
      };
    } catch (error: any) {
      console.error("❌ [DeleteQuestion Error]:", error.message);
      return { success: false, message: error.message };
    }
  }
  // attempt question

  async attempQuestion({ userId, questionId }: attemptQuestionValidationType) {
    try {

      // const question = await questionModel.findById()

    } catch (error: any) {
      throw new Error(error.message)
    }
  }

}

export const questionService = new QuestionService();
