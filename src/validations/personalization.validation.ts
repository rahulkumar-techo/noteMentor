import z from "zod";

/**
 * Personalization Validation Schema
 * Ensures user's learning and goal preferences are structured & validated
 */

export const personalizationValidation = z.object({
  learningSpeed: z.enum(["fast", "moderate", "slow"]).default("moderate"),
  goalType: z.enum(["score_improvement", "concept_clarity", "revision"]).default("concept_clarity"),
  focusDuration: z.number().min(10).max(180).default(25), // 10–180 minutes
  prevPerformance: z
    .array(
      z.object({
        subject: z.string().min(1, "Subject name is required"),
        accuracy: z.number().min(0).max(100),
      })
    )
    .optional()
    .default([]),
  noteUploadType: z.enum(["handwritten", "typed", "mixed"]).default("mixed"),
});

export type PersonalizationInput = z.infer<typeof personalizationValidation>;
