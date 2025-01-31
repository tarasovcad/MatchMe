import {z} from "zod";

export const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  agreement: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
