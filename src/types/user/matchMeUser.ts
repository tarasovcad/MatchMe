export interface MatchMeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  pronouns: string | null;
  age: number | null;
  image: string;
  current_role: string | null;
  looking_for: string | null;
  goals: string | null;
  tagline: string | null;
  skills: string | null;
  work_availability: number | null;
  location_timezone: string | null;
  languages: string | null;
  about_you: string | null;
  personal_website: string | null;
  social_links: string | null;
  is_profile_public: boolean;
  is_profile_verified: boolean;
  created_at: string;
  public_current_role: string | null;
}
