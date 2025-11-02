/**
 * Question Input Validation Schema (Zod - Compatible Version)
 */

import { z } from "zod";

export const questionValidation = z.object({
  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters long")
    .max(100, "Topic too long"),

  questionType: z.enum(["mcq", "short", "long"], "Invalid question type"),

  difficulty: z.enum(["easy", "medium", "hard"], "Invalid difficulty level"),

  quantity: z
    .number()
    .min(1, "At least 1 question required")
    .max(50, "Maximum 50 questions allowed"),

  quality: z.enum(["low", "normal", "high"], "Invalid quality type"),

  language: z.enum(["English", "Hindi", "Hinglish"], "Invalid language"),
});

export type QuestionValidationType = z.infer<typeof questionValidation>;


// Attempt question

export const attemptQuestionValidation = z.object({
  questionId: z.string(),
  userId: z.string(),
  answer: z.string(),
  type: z.enum(["mcq", "short", "long"]).optional(),
  difficulty:z.enum(["easy", "medium", "hard"]).optional(),
})

export type attemptQuestionValidationType = z.infer<typeof attemptQuestionValidation>;