import {z} from "zod";
import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {hasProfanity} from "@/utils/other/profanityCheck";

export const usernameSchema = z
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
    message: "Username contains inappropriate language. Please choose another.",
  })
  .transform((val) => val.toLowerCase());

// export const usernameSchema = z.union([
//   z.literal(""),
//   z
//     .string()
//     .min(4, {message: "Username must be at least 4 characters"})
//     .max(15, {message: "Username must be at most 15 characters"})
//     .regex(/^[a-z][a-z0-9_-]*$/, {
//       message:
//         "Username can only contain lower-case letters, numbers, hyphens (-), and underscores (_), and must start with a lower-case letter",
//     })
//     .refine((val) => !/[-_]{2,}/.test(val), {
//       message: "Username cannot have consecutive hyphens or underscores",
//     })
//     .refine((username) => !RESERVED_USERNAMES.includes(username), {
//       message: "Looks like this username is unavailable. Try something else!",
//     })
//     .refine((username) => !hasProfanity(username), {
//       message:
//         "Username contains inappropriate language. Please choose another.",
//     })
//     .transform((val) => val.toLowerCase()),
// ]);
