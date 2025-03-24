import {z} from "zod";
import {nameSchema} from "./nameValidation";
import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {hasProfanity} from "@/utils/other/profanityCheck";

export const signUpSchemaStep1 = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  agreement: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and policy",
  }),
});
export const signUpSchemaStep3 = z.object({
  name: nameSchema,
  username: z
    .string()
    .min(4, {message: "Username must be at least 4 characters"})
    .max(15, {message: "Username must be at most 15 characters"})
    .regex(/^[a-z][a-z0-9_-]*$/, {
      message:
        "Username can only contain lower-case letters, numbers, hyphens (-), and underscores (_), and must start with a lower-case letter",
    })
    .refine((val) => !/[-_]{2,}/.test(val), {
      message: "Username cannot have consecutive hyphens or underscores",
    })
    .refine((username) => !RESERVED_USERNAMES.includes(username), {
      message: "Looks like this username is unavailable. Try something else!",
    })
    .refine((username) => !hasProfanity(username), {
      message:
        "Username contains inappropriate language. Please choose another.",
    })
    .transform((val) => val.toLowerCase()),
});

export type SignUpFormData = z.infer<typeof signUpSchemaStep1> &
  z.infer<typeof signUpSchemaStep3>;
