export interface MatchMeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  pronouns: string | null;
  age: number | null;
  profile_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  background_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  looking_for: string | null;
  goal: string | null;
  dream: string | null;
  tagline: string | null;
  skills: string[] | null;
  tags: string[] | null;
  time_commitment: string | null;
  years_of_experience: number | null;
  location: string | null;
  languages: string | null;
  about_you: string | null;
  personal_website: string | null;
  is_profile_public: boolean;
  is_profile_verified: boolean;
  created_at: string;
  public_current_role: string | null;
  seniority_level: string | null;
  social_links_1_platform: string | null;
  social_links_1: string | null;
  social_links_2_platform: string | null;
  social_links_2: string | null;
  social_links_3_platform: string | null;
  social_links_3: string | null;
  username_changed_at: Date | null;
}

export interface CardMatchMeUser {
  id: string;
  name: string;
  username: string;
  profile_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  looking_for: string | null;
  tagline: string | null;
  skills: string[] | null;
  created_at: string;
  public_current_role: string | null;
  seniority_level: string | null;
}
// TODO: remove this interface and use the one above
export interface MiniCardMatchMeUser {
  id: string;
  name: string;
  username: string;
  profile_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
}

export type ProjectTeamMemberMinimal = {
  user_id: string;
  name: string;
  username: string;
  profile_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  display_name?: string | null; // alias for display_role on team membership
  isFollowing?: boolean; // current user -> member
  isFollowingBack?: boolean; // member -> current user
  is_owner?: boolean; // whether this member is the project owner
};
