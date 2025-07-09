import {MatchMeUser} from "@/types/user/matchMeUser";

export function canUserMakeProfilePublic(profile: MatchMeUser) {
  const requiredFields = [
    "name",
    "username",
    "public_current_role",
    "looking_for",
    "tagline",
    "skills",
    "about_you",
    "languages",
  ];

  const hasAllRequiredFields = requiredFields.every((field) => profile[field as keyof MatchMeUser]);

  return {
    canMakeProfilePublic: hasAllRequiredFields,
  };
}
