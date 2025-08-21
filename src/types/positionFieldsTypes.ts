import {Option} from "@/components/shadcn/multiselect";

export interface PositionFormFieldProps {
  fieldTitle: string;
  fieldDescription?: string;
  fieldType:
    | "text"
    | "select"
    | "selectWithSearch"
    | "number"
    | "dropdown"
    | "textarea"
    | "tags"
    | "slider"
    | "switch"
    | "date";
  fieldRequired?: boolean;
  fieldInputProps: [
    {
      id: string;
      placeholder?: string;
      type?: string;
      name: string;
      readOnly?: boolean;
      className?: string;
      disabled?: boolean;
      tags?: Option[];
      options?: PositionDropdownOption[];
      min?: number;
      max?: number;
    },
  ];
}

export interface PositionFormProps {
  formTitle: string;
  formDescription?: string;
  formData: PositionFormFieldProps[];
}

export interface PositionDropdownOption {
  title: string;
  description?: string;
}

export interface ProjectOpenPosition {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requirements: string;
  required_skills: string[];
  time_commitment: string;
  experience_level: string;
  status: "open" | "closed" | "draft";
  posted_by_user_id: string;
  posted_date: string;
  created_at: string;
  updated_at: string;
  // Additional fields for display
  posted_by_name?: string;
  posted_by_username?: string;
  posted_by_profile_image?:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  applicant_count?: number;
  // Optional per-viewer indicator
  has_pending_request?: boolean;
  has_any_pending_request?: boolean;
  pending_position_title?: string | null;
  // Enriched skills with images (for minimal views)
  required_skills_with_images?: Array<{name: string; image_url?: string}>;
  is_saved?: boolean;
}
