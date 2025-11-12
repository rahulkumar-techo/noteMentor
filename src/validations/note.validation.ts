import { z } from "zod";


export const noteValidationSchema = z.object({
  title: z.string().min(2).max(100),
  descriptions: z.string().min(5).max(5000),
});

export type NoteValidationInput = z.infer<typeof noteValidationSchema>;

export const noteSettingValidation = z.object({
  visibility: z.enum(["private", "public", "shared"]).optional(),
  sharedWith: z.array(z.string()).optional(), // assuming ObjectId as string
  shareLink: z.string().nullable().optional(),
  allowComments: z.boolean().optional(),
  allowDownloads: z.boolean().optional(),
});

export type NoteInputSetting = z.infer<typeof noteSettingValidation>;