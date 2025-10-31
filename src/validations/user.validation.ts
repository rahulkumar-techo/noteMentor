

import z, { email } from "zod";

export const updateProfileValidation = z.object({
  fullname: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must be less than 50 characters")
    .trim(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim(),


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


