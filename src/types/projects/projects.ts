export type Project = {
  id: string; // UUID
  user_id: string; // UUID

  name: string;
  slug: string;
  tagline: string;
  description: string;
  project_image: string;
  project_image_metadata: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
  demo: string[];
  background_image: string;
  background_image_metadata: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };

  category: string;
  current_stage: string;
  why_join: string;

  language_proficiency: string[];
  skills: string[];

  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  target_audience: string;
  revenue_expectations: string;
  collaboration_model: string;
  funding_investment: string;
  compensation_model: string;

  open_positions: {
    title: string;
    description: string;
    slots: number;
    required_skills: string[];
    engagement: string;
  }[];

  required_skills: string[];
  engagement_model: string;
  availability: string;
  working_hours: string;
  community_platforms: string;

  our_team: {
    user_id: string;
    name: string;
    role: string;
    profile_url: string;
  }[];
};
