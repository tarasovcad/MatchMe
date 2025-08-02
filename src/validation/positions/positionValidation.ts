import {z} from "zod";

export const positionValidationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, {message: "Position title must be at least 3 characters long"})
    .max(100, {message: "Position title must not exceed 100 characters"}),

  fullDescription: z
    .string()
    .trim()
    .min(100, {message: "Full description must be at least 100 characters"})
    .max(2000, {message: "Full description must not exceed 2000 characters"}),

  requirements: z
    .string()
    .trim()
    .min(50, {message: "Requirements must be at least 50 characters"})
    .max(1500, {message: "Requirements must not exceed 1500 characters"}),

  requiredSkills: z
    .array(z.string().trim().min(1, {message: "Each skill must be at least 1 character"}))
    .min(1, {message: "At least one skill is required"})
    .max(15, {message: "Maximum 15 skills allowed"}),

  experienceLevel: z.string().min(1, {message: "Experience level is required"}),

  status: z.enum(["Open", "Closed", "Draft"], {
    errorMap: () => ({message: "Status must be Open, Closed, or Draft"}),
  }),
});

export type PositionFormData = z.infer<typeof positionValidationSchema>;
