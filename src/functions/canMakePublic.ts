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
];

const PROJECT_REQUIRED_FIELDS: Array<keyof Project> = [
  "name",
  "slug",
  "working_hours",
  // "tagline",
  // "description",
  // "project_image",
  // "demo",
  // "background_image",
];

export function canMakePublic(entity: MatchMeUser | Project | undefined) {
  if (!entity) {
    return {canMakePublic: false};
  }

  // A project always contains a `slug` while a profile never does.
  const requiredFields = "slug" in entity ? PROJECT_REQUIRED_FIELDS : PROFILE_REQUIRED_FIELDS;

  const hasAllRequiredFields = requiredFields.every((field) =>
    Boolean((entity as Record<string, unknown>)[field]),
  );

  return {canMakePublic: hasAllRequiredFields};
}
