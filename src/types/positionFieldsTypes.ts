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
  applicant_count?: number;
}
