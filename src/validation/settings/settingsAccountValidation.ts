import {z} from "zod";

export const settingsAccountValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(20, {message: "Full name must be at most 20 characters"})
    .regex(
      /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/,
      "Enter a valid full name (First Last)",
    ),
});

export type SettingsAccountFormData = z.infer<
  typeof settingsAccountValidationSchema
>;
