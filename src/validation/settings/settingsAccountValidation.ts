import {languages} from "@/data/forms/(settings)/languages";
import {z} from "zod";

const allowedLanguages = new Set(languages.map((lang) => lang.value));

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
    .refine((val) => !val || val.trim().length > 0, {
      message: "Goals cannot be empty if provided",
    })
    .optional(),
  tagline: z
    .string()
    .max(70, {message: "Tagline must be at most 70 characters"})
    .refine((val) => !val || val.trim().length > 0, {
      message: "Tagline cannot be empty if provided",
    })
    .optional(),

  skills: z
    .array(
      z
        .string()
        .min(2, {message: "Each skill must be at least 2 characters"})
        .max(30, {message: "Each skill must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+\-* ]+$/, {
          message:
            "Skills can only contain letters, numbers, hyphens, # and + symbols",
        }),
    )
    .max(15, {message: "Skills must be at most 15 tags"})
    .optional(),

  work_availability: z.coerce
    .number()
    .min(0, {message: "Work availability cannot be negative"})
    .max(168, {message: "Work availability cannot exceed 168 hours per week"})
    .optional(),
  location_timezone: z.string().optional(),

  languages: z
    .array(
      z
        .string()
        .min(2, {message: "Each language must be at least 2 characters"})
        .max(30, {message: "Each language must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+\-* ]+$/, {
          message:
            "Languages can only contain letters, numbers, hyphens, # and + symbols",
        })
        .refine((val) => allowedLanguages.has(val), {
          message: "Language must be one of the supported languages",
        }),
    )
    .max(15, {message: "Languages must be at most 15 tags"})
    .optional(),
  about_you: z
    .string()
    .max(600, {message: "Description must be at most 600 characters"})
    .refine((val) => !val || val.trim().length > 0, {
      message: "Description cannot be empty if provided",
    })
    .optional(),
  personal_website: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          // Check if hostname has at least one dot and valid TLD pattern
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(
            url.hostname,
          );
        } catch (e) {
          return false;
        }
      },
      {message: "Please enter a valid website URL with a proper domain"},
    )
    .refine((val) => !/[A-Z]/.test(val), {
      message: "The URL should not contain uppercase letters",
    })
    .optional()
    .or(z.literal("")),
  social_links_1_platform: z.string().optional(),
  social_links_1: z
    .string()
    .max(10, {message: "Social link must be at most 50 characters"})
    .refine((val) => !val || val.trim().length > 0, {
      message: "Description cannot be empty if provided",
    })
    .optional(),
  social_links_2_platform: z.string().optional(),
  social_links_2: z
    .string()
    .max(10, {message: "Social link must be at most 50 characters"})
    .refine((val) => !val || val.trim().length > 0, {
      message: "Description cannot be empty if provided",
    })
    .optional(),
  social_links_3_platform: z.string().optional(),
  social_links_3: z
    .string()
    .max(10, {message: "Social link must be at most 50 characters"})
    .refine((val) => !val || val.trim().length > 0, {
      message: "Description cannot be empty if provided",
    })
    .optional(),
  is_profile_public: z.boolean().optional(),
  is_profile_verified: z.boolean().optional(),
});

export type SettingsAccountFormData = z.infer<
  typeof settingsAccountValidationSchema
>;
