import {z} from "zod";
import {usernameSchema} from "./usernameValidation";
import {nameSchema} from "./nameValidation";

export const signUpSchemaStep1 = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  agreement: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and policy",
  }),
});
export const signUpSchemaStep3 = z.object({
  name: nameSchema,
  username: usernameSchema,
});

export type SignUpFormData = z.infer<typeof signUpSchemaStep1> &
  z.infer<typeof signUpSchemaStep3>;
