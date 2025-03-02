import {z} from "zod";

export const skillsValidation = z.object({
  name: z.string().min(1, "Skill name is required"),
  imageUrl: z.string().min(1, "Skill image url is required"),
});

export type SkillsFormData = z.infer<typeof skillsValidation>;
