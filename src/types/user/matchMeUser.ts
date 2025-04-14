export interface MatchMeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  pronouns: string | null;
  age: number | null;
  image: string;
  looking_for: string | null;
  goal: string | null;
  tagline: string | null;
  skills: string[] | null;
  work_availability: number | null;
  location: string | null;
  languages: string | null;
  about_you: string | null;
  personal_website: string | null;
  is_profile_public: boolean;
  is_profile_verified: boolean;
  created_at: string;
  public_current_role: string | null;
  social_links_1_platform: string | null;
  social_links_1: string | null;
  social_links_2_platform: string | null;
  social_links_2: string | null;
  social_links_3_platform: string | null;
  social_links_3: string | null;
  username_changed_at: Date | null;
}
