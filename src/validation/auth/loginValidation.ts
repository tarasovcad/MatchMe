import {z} from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export type LoginFormData = z.infer<typeof signInSchema>;
