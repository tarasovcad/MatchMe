import {languages} from "@/data/forms/(settings)/languages";
import {projectCategories} from "@/data/forms/create-project/projectCategories";
import {projectStages} from "@/data/forms/create-project/projectStages";
import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";
import {z} from "zod";

const allowedStages = new Set(projectStages.map((value) => value.title));
const allowedCategories = new Set(projectCategories.map((cat) => cat.title));
const allowedLanguages = new Set(languages.map((lang) => lang.value));

export const projectCreationValidationSchema = z.object({
  // 1 step
  name: z
    .string()
    .min(3, {message: "Project name must be at least 3 characters long"})
    .max(40, {message: "Project name must not exceed 40 characters"})
    .regex(/^[a-zA-Z0-9\s\-_]+$/, {
      message: "Only letters, numbers, spaces, dashes, and underscores are allowed",
    })
    .trim(),
  slug: z
    .string()
    .min(3, {message: "Slug must be at least 3 characters long"})
    .max(40, {message: "Slug must not exceed 40 characters"})
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase and can include hyphens (e.g., my-project-name)",
    })
    .refine((slug) => !RESERVED_PROJECT_SLUGS.includes(slug.toLowerCase()), {
      message: "This slug is reserved and cannot be used",
    }),
  tagline: z
    .string()
    .min(5, "Tagline must be at least 5 characters")
    .max(70, "Tagline must not exceed 70 characters"),
  project_image: z.string().optional(),
  project_image_metadata: z
    .object({
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      uploadedAt: z.string().optional(),
    })
    .nullable()
    .optional(),
  background_image: z.string().optional(),
  background_image_metadata: z
    .object({
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      uploadedAt: z.string().optional(),
    })
    .nullable()
    .optional(),
  // 2 step
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1500, "Description must not exceed 1500 characters"),
  why_join: z.string().max(1000, "Why join must not exceed 1000 characters"),
  project_website: z
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
  category: z
    .string()
    .min(1, {message: "Category is required"})
    .refine((val) => allowedCategories.has(val), {
      message: "Please select a valid project category",
    }),
  current_stage: z.string().refine((val) => allowedStages.has(val), {
    message: "Please select a valid project stage",
  }),
  target_audience: z.string(),
  demo: z.array(z.string()),
  demo_metadata: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
      }),
    )
    .optional(),
  language_proficiency: z
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
  technology_stack: z
    .array(
      z
        .string()
        .min(1, {message: "Each skill must be at least 1 character"})
        .max(30, {message: "Each skill must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+\-*/ ]+$/, {
          message: "Skills can only contain letters, numbers, hyphens, #, +, and / symbols",
        }),
    )
    .min(1, {message: "At least one skill is required"})
    .max(15, {message: "Skills must be at most 15 tags"}),
  // Hidden field to track slug loading state
  _slugLoading: z.boolean().optional(),
});

export type ProjectCreationFormData = z.infer<typeof projectCreationValidationSchema>;
