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
  username: z.string(),
  age: z.number().int().min(18, "You must be at least 18 years old"),
});

export type SettingsAccountFormData = z.infer<
  typeof settingsAccountValidationSchema
>;
