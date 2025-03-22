import {z} from "zod";

export const settingsSecurityValidationSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export type SettingsSecurityFormData = z.infer<
  typeof settingsSecurityValidationSchema
>;
