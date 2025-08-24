import {Project} from "@/types/projects/projects";
import {MatchMeUser} from "@/types/user/matchMeUser";

const PROFILE_REQUIRED_FIELDS: Array<keyof MatchMeUser> = [
  "name",
  "username",
  "public_current_role",
  "looking_for",
  "tagline",
  "skills",
  "about_you",
  "languages",
  "profile_image",
];

const PROJECT_REQUIRED_FIELDS: Array<keyof Project> = [
  "name",
  "slug",
  "tagline",
  "description",
  "category",
  "current_stage",
  "expected_timeline",
  "language_proficiency",
  "technology_stack",
  "collaboration_model",
  "time_commitment",
  "revenue_expectations",
  "funding_investment",
  "compensation_model",
];

export function canMakePublic(entity: MatchMeUser | Project | undefined) {
  if (!entity) {
    return {canMakePublic: false};
  }

  // A project always contains a `slug` while a profile never does.
  const requiredFields = "slug" in entity ? PROJECT_REQUIRED_FIELDS : PROFILE_REQUIRED_FIELDS;

  const hasAllRequiredFields = requiredFields.every((field) => {
    const value = (entity as Record<string, unknown>)[field];

    // Special handling for profile_image array field
    if (field === "profile_image") {
      return Array.isArray(value) && value.length > 0;
    }

    return Boolean(value);
  });

  return {canMakePublic: hasAllRequiredFields};
}
