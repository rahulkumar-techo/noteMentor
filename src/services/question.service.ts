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
import { QuestionValidationType } from "../validations/question.validation";

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

        // 🔹 Type-based mapping
        switch (data.questionType) {
          case "mcq":
            return {
              ...baseData,
              mcq: {
                options: q.options?.map((opt: string) => ({ text: opt })) || [],
                correctAnswer: q.correctAnswer || null,
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
}

export const questionService = new QuestionService();
