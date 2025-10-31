

import { z } from "zod";

export const academicValidation = z.object({
  board: z
    .string()
    .trim()
    .min(3, "Board name must be at least 3 characters long")
    .max(50, "Board name must be less than 50 characters")
    .optional(),

  classOrYear: z
    .string()
    .trim()
    .min(1, "Class or year cannot be empty")
    .max(10, "Class name seems too long")
    .optional(),

  subjects: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Subject name must be at least 2 characters long")
    )
    .nonempty("At least one subject is required")
    .max(15, "Too many subjects selected")
    .optional(),

  languagePreference: z
    .enum(["english", "hindi", "hinglish"] as const, {
      message: "Language must be english, hindi, or hinglish",
    })
    .default("english")
    .optional(),

  examGoal: z
    .string()
    .trim()
    .min(3, "Exam goal must be at least 3 characters")
    .max(50, "Exam goal must be less than 50 characters")
    .optional()
});

export type AcademicInput = z.infer<typeof academicValidation>;
