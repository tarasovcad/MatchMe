import {z} from "zod";
import {experienceLevels} from "@/data/projects/experienceLevels";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";

// Common spam patterns to prevent
const SPAM_PATTERNS = [
  /^(.)\1{4,}$/, // 5+ repeated characters (aaaaa, 11111)
  /^(..)\1{2,}$/, // 3+ repeated pairs (abababab)
  /^(123+|abc+|qwerty+|asdf+|test+|demo+|sample+|job+|position+|role+)$/i,
  /^\d+$/, // Only numbers
  /^[!@#$%^&*()]+$/, // Only special characters
];

// Validation helpers
const hasRepeatedChars = (str: string): boolean => {
  return /(.)\1{3,}/.test(str); // 4+ consecutive identical chars
};

const hasVariety = (str: string): boolean => {
  const cleanStr = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const uniqueChars = new Set(cleanStr).size;
  return uniqueChars >= Math.min(3, Math.ceil(cleanStr.length / 3));
};

const isSpamPattern = (str: string): boolean => {
  const cleanStr = str.toLowerCase().trim();
  return SPAM_PATTERNS.some((pattern) => pattern.test(cleanStr));
};

const allowedExperienceLevels = new Set(experienceLevels.map((level) => level.value));
const allowedTimeCommitment = new Set(timeCommitment.map((option) => option.value));

export const positionValidationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, {message: "Position title must be at least 3 characters long"})
    .max(50, {message: "Position title must not exceed 50 characters"})
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, {
      message:
        "Position title can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and parentheses",
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: "Position title cannot have more than 3 consecutive identical characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Position title must contain at least 3 different characters",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please choose a more meaningful position title",
    })
    .refine((val) => val.split(" ").length >= 1, {
      message: "Position title should be descriptive",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Position title cannot be all uppercase",
    }),

  description: z
    .string()
    .trim()
    .min(100, {message: "Description must be at least 100 characters"})
    .max(2000, {message: "Description must not exceed 2000 characters"})
    .refine((val) => !hasRepeatedChars(val), {
      message: "Description cannot have repetitive characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Description must contain diverse and meaningful content",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please write a genuine description of the position",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Description cannot be all uppercase",
    }),
  requirements: z
    .string()
    .trim()
    .min(50, {message: "Requirements must be at least 50 characters"})
    .max(1500, {message: "Requirements must not exceed 1500 characters"})
    .refine((val) => !hasRepeatedChars(val), {
      message: "Requirements cannot have repetitive characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Requirements must contain meaningful and varied content",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please write genuine requirements for the position",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Requirements cannot be all uppercase",
    }),
  required_skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, {message: "Each skill must be at least 1 character"})
        .max(30, {message: "Each skill must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+\-*/ ]+$/, {
          message: "Skills can only contain letters, numbers, hyphens, #, +, and / symbols",
        }),
    )
    .min(1, {message: "At least one skill is required"})
    .max(15, {message: "Maximum 15 skills allowed"})
    .refine(
      (skills) => {
        const uniqueSkills = new Set(skills.map((s) => s.toLowerCase().trim()));
        return uniqueSkills.size === skills.length;
      },
      {
        message: "Skills must be unique (no duplicates)",
      },
    ),

  experience_level: z
    .string()
    .min(1, {message: "Experience level is required"})
    .refine((val) => allowedExperienceLevels.has(val), {
      message: "Please select a valid experience level",
    }),

  time_commitment: z
    .string()
    .min(1, {message: "Time commitment is required"})
    .refine((val) => allowedTimeCommitment.has(val), {
      message: "Please select a valid time commitment option",
    }),

  status: z.enum(["open", "closed", "draft"], {
    errorMap: () => ({message: "Status must be Open, Closed, or Draft"}),
  }),
});

export type PositionFormData = z.infer<typeof positionValidationSchema>;
