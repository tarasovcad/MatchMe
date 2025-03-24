import {z} from "zod";
import {usernameSchema} from "../auth/usernameValidation";

export const settingsSecurityValidationSchema = z.object({
  email: z.string().email().optional(),
  username: usernameSchema,
  newUsername: usernameSchema,
});

export type SettingsSecurityFormData = {
  username: string;
  newUsername: string;
  email?: string;
  username_changed_at?: string;
};
