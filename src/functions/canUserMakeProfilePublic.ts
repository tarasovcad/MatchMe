import {MatchMeUser} from "@/types/user/matchMeUser";

export function canUserMakeProfilePublic(profile: MatchMeUser) {
  const essentialFields = [
    "name",
    "username",
    "email",
    "image",
    "tagline",
    "skills",
    "goal",
  ];
  const additionalFields = [
    {name: "looking_for", points: 10},
    {name: "work_availability", points: 5},
    {name: "location_timezone", points: 5},
    {name: "languages", points: 5},
    {name: "personal_website", points: 5},
    {name: "public_current_role", points: 10},
    {name: "social_links_1", points: 5},
    {name: "social_links_2", points: 5},
    {name: "social_links_3", points: 5},
  ];
  const minRequiredPoints = 25;

  const hasAllEssentialFields = essentialFields.every(
    (field) => profile[field as keyof MatchMeUser],
  );

  if (!hasAllEssentialFields) {
    return {
      canMakeProfilePublic: false,
    };
  }

  let points = 0;

  additionalFields.forEach((field) => {
    if (profile[field.name as keyof MatchMeUser]) {
      points += field.points;
    }
  });

  if (points < minRequiredPoints) {
    return {
      canMakeProfilePublic: false,
    };
  }
  return {
    canMakeProfilePublic: true,
  };
}
