export interface MatchMeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  pronouns: string | null;
  age: number | null;
  image: string;
  looking_for: string | null;
  goals: string | null;
  tagline: string | null;
  skills: string | null;
  work_availability: string | null;
  location_timezone: string | null;
  languages_spoken: string | null;
  about_you: string | null;
  personal_website: string | null;
  social_links: string | null;
  is_profile_public: boolean;
  created_at: string;
}
