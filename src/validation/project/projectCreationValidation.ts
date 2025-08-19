import {languages} from "@/data/forms/(settings)/languages";
import {projectCategories} from "@/data/projects/projectCategories";
import {projectStages} from "@/data/projects/projectStages";
import {collaborationModels} from "@/data/projects/collaborationModels";
import {collaborationStyles} from "@/data/projects/collaborationStyles";
import {expectedTimelineOptions} from "@/data/projects/expectedTimelineOptions";
import {revenueExpectations} from "@/data/projects/revenueExpectations";
import {fundingInvestment} from "@/data/projects/fundingInvestment";
import {compensationModels} from "@/data/projects/compensationModels";
import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";
import {z} from "zod";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";

// Common spam patterns to prevent
const SPAM_PATTERNS = [
  /^(.)\1{4,}$/, // 5+ repeated characters (aaaaa, 11111)
  /^(..)\1{2,}$/, // 3+ repeated pairs (abababab)
  /^(123+|abc+|qwerty+|asdf+|test+|demo+|sample+)$/i,
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

const allowedStages = new Set(projectStages.map((value) => value.value));
const allowedCategories = new Set(projectCategories.map((cat) => cat.title));
const allowedLanguages = new Set(languages.map((lang) => lang.value));
const allowedCollaborationModels = new Set(collaborationModels.map((model) => model.value));
const allowedCollaborationStyles = new Set(collaborationStyles.map((style) => style.value));
const allowedExpectedTimelines = new Set(expectedTimelineOptions.map((timeline) => timeline.value));
const allowedRevenueExpectations = new Set(
  revenueExpectations.map((expectation) => expectation.value),
);
const allowedFundingInvestment = new Set(fundingInvestment.map((funding) => funding.value));
const allowedCompensationModels = new Set(compensationModels.map((model) => model.value));

export const projectCreationValidationSchema = z.object({
  is_project_public: z.boolean(),
  // 1 step - Enhanced validations
  name: z
    .string()
    .trim()
    .min(3, {message: "Project name must be at least 3 characters long"})
    .max(40, {message: "Project name must not exceed 40 characters"})
    .regex(/^[a-zA-Z0-9\s\-_]+$/, {
      message: "Only letters, numbers, spaces, dashes, and underscores are allowed",
    })
    .refine((val) => !hasRepeatedChars(val), {
      message: "Project name cannot have more than 3 consecutive identical characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Project name must contain at least 3 different characters",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please choose a more meaningful project name",
    }),
  slug: z
    .string()
    .min(3, {message: "Slug must be at least 3 characters long"})
    .max(40, {message: "Slug must not exceed 40 characters"})
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase and can include hyphens (e.g., my-project-name)",
    })
    .refine((val) => !hasRepeatedChars(val.replace(/-/g, "")), {
      message: "Slug cannot have repetitive patterns",
    })
    .refine((val) => hasVariety(val.replace(/-/g, "")), {
      message: "Slug must be more unique and varied",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please choose a more meaningful slug",
    })
    .refine((slug) => !RESERVED_PROJECT_SLUGS.includes(slug.toLowerCase()), {
      message: "This slug is reserved and cannot be used",
    }),
  tagline: z
    .string()
    .min(10, "Tagline must be at least 10 characters")
    .max(70, "Tagline must not exceed 70 characters")
    .refine((val) => !hasRepeatedChars(val), {
      message: "Tagline cannot have repetitive characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Tagline must be descriptive with varied content",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please write a meaningful tagline describing your project",
    })
    .refine((val) => val.split(" ").length >= 2, {
      message: "Tagline should contain at least 2 words",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Tagline cannot be all uppercase",
    }),
  project_image: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
        url: z.string(),
      }),
    )
    .max(1)
    .optional(),
  background_image: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
        url: z.string(),
      }),
    )
    .max(1)
    .optional(),
  // 2 step - Enhanced validations
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(1500, "Description must not exceed 1500 characters")
    .refine((val) => !hasRepeatedChars(val), {
      message: "Description cannot have repetitive characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Description must contain diverse and meaningful content",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please write a genuine description of your project",
    })
    .refine((val) => val.split(" ").length >= 8, {
      message: "Description should be more detailed (at least 8 words)",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Description cannot be all uppercase",
    }),
  why_join: z
    .string()
    .trim()
    .min(20, "Why join must be at least 20 characters")
    .max(1000, "Why join must not exceed 1000 characters")
    .refine((val) => !hasRepeatedChars(val), {
      message: "Why join cannot have repetitive characters",
    })
    .refine((val) => hasVariety(val), {
      message: "Why join must contain meaningful and varied content",
    })
    .refine((val) => !isSpamPattern(val), {
      message: "Please explain genuine reasons to join your project",
    })
    .refine((val) => val.split(" ").length >= 5, {
      message: "Why join should be more descriptive (at least 5 words)",
    })
    .refine((val) => !/^[A-Z\s!?.,]+$/.test(val), {
      message: "Why join cannot be all uppercase",
    })
    .optional()
    .or(z.literal("")),
  project_website: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url.hostname);
        } catch {
          return false;
        }
      },
      {message: "Please enter a valid website URL with a proper domain"},
    )
    .refine((val) => !/[A-Z]/.test(val), {
      message: "The URL should not contain uppercase letters",
    })
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .min(1, {message: "Category is required"})
    .refine((val) => allowedCategories.has(val), {
      message: "Please select a valid project category",
    }),
  current_stage: z.string().refine((val) => allowedStages.has(val), {
    message: "Please select a valid project stage",
  }),
  expected_timeline: z
    .string()
    .min(1, {message: "Expected timeline is required"})
    .refine((val) => allowedExpectedTimelines.has(val), {
      message: "Please select a valid expected timeline",
    }),
  target_audience: z.string(),
  demo: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        uploadedAt: z.string(),
        url: z.string(),
      }),
    )
    .max(5)
    .optional(),
  // 3 step
  language_proficiency: z
    .array(
      z
        .string()
        .trim()
        .min(2, {message: "Each language must be at least 2 characters"})
        .max(30, {message: "Each language must be at most 30 characters"})
        .regex(/^[A-Za-z]+$/, {
          message: "Languages can only contain letters (no spaces, numbers, or symbols)",
        })
        .refine((val) => allowedLanguages.has(val), {
          message: "Language must be one of the supported languages",
        }),
    )
    .min(1, {message: "At least one language is required"})
    .max(15, {message: "Languages must be at most 15 tags"}),
  technology_stack: z
    .array(
      z
        .string()
        .trim()
        .min(1, {message: "Each technology must be at least 1 character"})
        .max(30, {message: "Each technology must be at most 30 characters"})
        .regex(/^[A-Za-z0-9#+.\-*/ ]+$/, {
          message: "Technologies can contain letters, numbers, and common symbols (# + . - * /)",
        })
        .refine((val) => !isSpamPattern(val), {
          message: "Please enter valid technology names only",
        }),
    )
    .min(1, {message: "At least one skill is required"})
    .max(15, {message: "Skills must be at most 15 tags"}),
  // 4 step
  collaboration_style: z
    .string()
    .min(1, {message: "Collaboration style is required"})
    .refine((val) => allowedCollaborationStyles.has(val), {
      message: "Please select a valid collaboration style",
    }),
  time_commitment: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || timeCommitment.some((option) => option.value === val), {
      message: "Invalid time commitment. Please select a valid option.",
    }),
  community_platforms: z
    .array(
      z
        .string()
        .trim()
        .min(1, {message: "Each platform must be at least 1 character"})
        .max(30, {message: "Each platform must be at most 30 characters"})
        .regex(/^[A-Za-z0-9\s\-_+.]+$/, {
          message: "Platform names can only contain letters, numbers, spaces, and common symbols",
        })
        .refine((val) => !hasRepeatedChars(val), {
          message: "Platform names cannot have repetitive characters",
        })
        .refine((val) => hasVariety(val), {
          message: "Platform names must be meaningful and varied",
        })
        .refine((val) => !isSpamPattern(val), {
          message: "Please enter valid communication platform names",
        })
        .refine((val) => !/^[0-9]+$/.test(val), {
          message: "Platform names cannot be only numbers",
        }),
    )
    .max(10, {message: "Communication tools must be at most 10 items"})
    .optional(),
  // 5 step
  revenue_expectations: z
    .string()
    .min(1, {message: "Revenue expectations is required"})
    .refine((val) => allowedRevenueExpectations.has(val), {
      message: "Please select a valid revenue expectation",
    }),
  funding_investment: z
    .string()
    .min(1, {message: "Funding & investment status is required"})
    .refine((val) => allowedFundingInvestment.has(val), {
      message: "Please select a valid funding status",
    }),
  compensation_model: z
    .string()
    .min(1, {message: "Compensation model is required"})
    .refine((val) => allowedCompensationModels.has(val), {
      message: "Please select a valid compensation model",
    }),
  // Hidden field to track slug loading state
  _slugLoading: z.boolean().optional(),
});

export type ProjectCreationFormData = z.infer<typeof projectCreationValidationSchema>;
