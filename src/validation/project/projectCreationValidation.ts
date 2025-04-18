import {z} from "zod";

export const projectCreationValidationSchema = z.object({
  project_name: z.string().min(1),
});

export type ProjectCreationFormData = z.infer<typeof projectCreationValidationSchema>;
