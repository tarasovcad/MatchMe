import {languages} from "@/data/forms/(settings)/languages";
import {socialLinks} from "@/data/forms/(settings)/socialLinks";
import {z} from "zod";
import {nameSchema} from "../auth/nameValidation";

const allowedLanguages = new Set(languages.map((lang) => lang.value));
const allowedSocialLinks = new Set(socialLinks.map((link) => link.title));
export const settingsAccountValidationSchema = z.object({
  is_profile_public: z.boolean(),
  is_profile_verified: z.boolean(),
  name: nameSchema,
  username: z.string(),
  pronouns: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || ["He/Him", "She/Her", "They/Them"].includes(val), {
      message: "Invalid pronoun choice. Please select a valid option.",
    }),
  age: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "") return undefined;
      return typeof val === "string" ? parseInt(val, 10) : val;
    })
    .pipe(
      z
        .number()
        .int()
        .min(18, "You must be at least 18 years old")
        .max(100, "You must enter a valid age")
        .optional(),
    )
    .optional(),
  public_current_role: z
    .string()
    .max(30, {message: "Current role must be at most 30 characters"})
    .refine((val) => !val || /^[A-Za-z\s-/]+$/.test(val), {
      message:
        "Current role can only contain English letters, spaces, hyphens, and forward slashes",
    })
    .optional(),
  looking_for: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || ["Team Member", "Co-Founder", "Startups"].includes(val),
      {
        message: "Invalid selection. Please select a valid option.",
      },
    ),
  goal: z.string().max(200, {message: "Goals must be at most 200 characters"}).optional(),
  tagline: z.string().max(70, {message: "Tagline must be at most 70 characters"}),
  skills: z
    .array(
      z
        .string()
        .min(1, {message: "Each skill must be at least 1 character"})
        .max(30, {message: "Each skill must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+\-*/ ]+$/, {
          message: "Skills can only contain letters, numbers, hyphens, #, +, and / symbols",
        }),
    )
    .max(15, {message: "Skills must be at most 15 tags"})
    .optional(),

  work_availability: z.coerce
    .number()
    .min(0, {message: "Work availability cannot be negative"})
    .max(168, {message: "Work availability cannot exceed 168 hours per week"})
    .optional(),
  location: z.string().optional(),

  languages: z
    .array(
      z
        .string()
        .min(2, {message: "Each language must be at least 2 characters"})
        .max(30, {message: "Each language must be at most 30 characters"})
        .regex(/^[A-Za-z]+$/, {
          message: "Languages can only contain letters (no spaces, numbers, or symbols)",
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
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url.hostname);
        } catch {
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

  social_links_1_platform: z
    .string()
    .refine((val) => allowedSocialLinks.has(val), {
      message: "Language must be one of the supported languages",
    })
    .optional(),
  social_links_1: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .pipe(
      z
        .string()
        .max(50, {message: "Username must be at most 50 characters"})
        .regex(/^[a-zA-Z0-9_.-]+$/, {
          message: "Username can only contain letters, numbers, underscores, dots, and hyphens",
        })
        .refine((val) => !val.includes(".."), {
          message: "Username cannot contain consecutive dots",
        })
        .optional(),
    ),
  social_links_2_platform: z
    .string()
    .refine((val) => allowedSocialLinks.has(val), {
      message: "Language must be one of the supported languages",
    })
    .optional(),
  social_links_2: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .pipe(
      z
        .string()
        .max(50, {message: "Username must be at most 50 characters"})
        .regex(/^[a-zA-Z0-9_.-]+$/, {
          message: "Username can only contain letters, numbers, underscores, dots, and hyphens",
        })
        .refine((val) => !val.includes(".."), {
          message: "Username cannot contain consecutive dots",
        })
        .optional(),
    ),
  social_links_3_platform: z
    .string()
    .refine((val) => allowedSocialLinks.has(val), {
      message: "Language must be one of the supported languages",
    })
    .optional(),
  social_links_3: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .pipe(
      z
        .string()
        .max(50, {message: "Username must be at most 50 characters"})
        .regex(/^[a-zA-Z0-9_.-]+$/, {
          message: "Username can only contain letters, numbers, underscores, dots, and hyphens",
        })
        .refine((val) => !val.includes(".."), {
          message: "Username cannot contain consecutive dots",
        })
        .optional(),
    ),
  profile_image: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
        url: z.string(),
      }),
    )
    .max(1)
    .optional(),
  background_image: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
        url: z.string(),
      }),
    )
    .max(1)
    .optional(),
});

export type SettingsAccountFormData = z.infer<typeof settingsAccountValidationSchema>;
