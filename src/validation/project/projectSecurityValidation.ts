import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";
import {z} from "zod";

export const projectSecurityValidationSchema = z.object({
  slug: z
    .string()
    .min(3, {message: "Slug must be at least 3 characters long"})
    .max(40, {message: "Slug must not exceed 40 characters"})
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase and can include hyphens (e.g., my-project-name)",
    })
    .refine((slug) => !RESERVED_PROJECT_SLUGS.includes(slug.toLowerCase()), {
      message: "This slug is reserved and cannot be used",
    })
    .transform((val) => val.toLowerCase()),
  newSlug: z
    .string()
    .trim()
    .refine((val) => val === "" || val.length >= 3, {
      message: "Slug must be at least 3 characters long",
    })
    .refine((val) => val === "" || val.length <= 40, {
      message: "Slug must not exceed 40 characters",
    })
    .refine((val) => val === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "Slug must be lowercase and can include hyphens (e.g., my-project-name)",
    })
    .refine((val) => val === "" || !RESERVED_PROJECT_SLUGS.includes(val.toLowerCase()), {
      message: "This slug is reserved and cannot be used",
    })
    .transform((val) => val.toLowerCase()),
});

export type ProjectSecurityFormData = {
  slug: string;
  newSlug: string;
};
