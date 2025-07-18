export type Project = {
  id: string; // UUID
  user_id: string; // UUID

  name: string;
  slug: string;
  tagline: string;
  description: string;
  project_image: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    url: string;
  }[];
  demo: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    url: string;
  }[];
  background_image: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    url: string;
  }[];

  category: string;
  current_stage: string;
  why_join: string;

  language_proficiency: string[];
  technology_stack: string[];

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
  project_website: string;

  is_project_public: boolean;
};

export type TeamPermission = "owner" | "co_owner" | "admin" | "editor" | "viewer" | "member";

export type ProjectTeamMember = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  role: string;
  joined_date: string;
  permission: TeamPermission;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectWithAccess = Project & {
  userPermission: TeamPermission;
  isOwner: boolean;
  project_team_members?: ProjectTeamMember[];
};
