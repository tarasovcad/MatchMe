import {z} from "zod";

export const projectCreationValidationSchema = z.object({
  name: z
    .string()
    .min(3, {message: "Project name must be at least 3 characters long"})
    .max(60, {message: "Project name must not exceed 60 characters"})
    .regex(/^[a-zA-Z0-9\s\-_]+$/, {
      message: "Only letters, numbers, spaces, dashes, and underscores are allowed",
    })
    .trim(),
  slug: z
    .string()
    .min(3, {message: "Slug must be at least 3 characters long"})
    .max(30, {message: "Slug must not exceed 30 characters"})
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase and can include hyphens (e.g., my-project-name)",
    }),
});

export type ProjectCreationFormData = z.infer<typeof projectCreationValidationSchema>;
