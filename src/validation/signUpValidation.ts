import {z} from "zod";

export const signUpSchemaStep1 = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  agreement: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and policy",
  }),
});
export const signUpSchemaStep3 = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(20, {message: "Full name must be at most 20 characters"})
    .regex(
      /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/,
      "Enter a valid full name (First Last)",
    ),
  username: z
    .string()
    .min(4, {message: "Username must be at least 4 characters"})
    .max(20, {message: "Username must be at most 20 characters"})
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
      message:
        "Username can only contain letters, numbers, hyphens (-), and underscores (_), and must start with a letter",
    })
    .refine((val) => !/[-_]{2,}/.test(val), {
      message: "Username cannot have consecutive hyphens or underscores",
    }),
});

export type SignUpFormData = z.infer<typeof signUpSchemaStep1> &
  z.infer<typeof signUpSchemaStep3>;
