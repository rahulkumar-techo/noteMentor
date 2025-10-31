// ✅ device.validation.ts
import { z } from "zod";

/**
 * Validation schema for user device settings
 */
export const deviceValidation = z.object({
  deviceType: z.enum(["mobile", "tablet", "pc"]).default("mobile"),
  offlineMode: z.boolean().default(false),
  storageSync: z.enum(["local", "cloud"]).default("cloud"),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
});

export type TDeviceSettings = z.infer<typeof deviceValidation>;
