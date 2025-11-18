

import z, { email } from "zod";

export const updateProfileValidation = z.object({
  fullname: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must be less than 50 characters")
    .trim().optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim().optional(),


});

export const registerValidation = z.object({
  fullname: z
    .string()
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerValidation>;


export const registerVerificationValidation = z.object({
  otp: z.string().min(6, "6 digits"),
  email: z.string().email()
})
export type RegisterVerificationInput = z.infer<typeof registerVerificationValidation>;

// login 

export const loginValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
})
export type LoginValidationInput = z.infer<typeof loginValidation>;


const RoleSchema = z.enum(["student", "teacher", "admin", "guest"]).default("guest");

const AcademicSchema = z.object({
  board: z.string().trim().max(100).optional(),
  classOrYear: z.string().trim().max(50).optional(),

  subjects: z
    .array(z.string().trim().min(1, "subject cannot be empty"))
    .max(20, "subjects cannot have more than 20 items")
    .default([]),  // ← FIXED

  languagePreference: z.enum(["english", "hindi", "hinglish"]).default("english"),

  examGoal: z.string().trim().max(200).default("").optional(),
});

const PersonalizationSchema = z.object({
  learningSpeed: z.enum(["slow", "moderate", "fast"]).default("moderate"),
  goalType: z.enum(["score_improvement", "concept_clarity", "revision"]).default("concept_clarity"),
  focusDuration: z.number().int().min(5).max(240).default(25),
  noteUploadType: z.enum(["handwritten", "typed", "mixed"]).default("mixed"),
});

export const UserPayloadSchema = z.object({
  role: RoleSchema,
  academic: AcademicSchema,
  personalization: PersonalizationSchema,
});

export type UserPayload = z.infer<typeof UserPayloadSchema>;
