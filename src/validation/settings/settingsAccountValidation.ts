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
  pronouns: z
    .string()
    .refine((val) => ["He/Him", "She/Her", "They/Them"].includes(val), {
      message: "Invalid pronoun choice. Please select a valid option.",
    })
    .optional(),
  age: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(
      z
        .number()
        .int()
        .min(18, "You must be at least 18 years old")
        .max(100, "You must be at most 100 years old"),
    )
    .optional(),
  public_current_role: z
    .string()
    .max(30, {message: "Current role must be at most 30 characters"})
    .refine((val) => !val || /^[A-Za-z\s-]+$/.test(val), {
      message:
        "Current role can only contain English letters, spaces, and hyphens",
    })
    .optional(),
  looking_for: z
    .string()
    .refine((val) => ["Team Member", "Co-Founder", "Startups"].includes(val), {
      message: "Invalid selection. Please select a valid option.",
    })
    .optional(),
  goals: z
    .string()
    .max(200, {message: "Goals must be at most 200 characters"})
    .optional(),
  tagline: z
    .string()
    .max(70, {message: "Tagline must be at most 70 characters"})
    .optional(),
  skills: z
    .array(z.string())
    .max(20, {message: "Skills must be at most 20 tags"})
    .optional(),
  work_availability: z.coerce.number().optional(),
});

export type SettingsAccountFormData = z.infer<
  typeof settingsAccountValidationSchema
>;
