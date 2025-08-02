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
  title: string;
  fullDescription: string;
  requirements: string;
  requiredSkills: string[];
  applicants: number;
  timeCommitment: string;
  experienceLevel: string;
  status: "Open" | "Closed" | "Draft";
  createdAt: string;
  updatedAt: string;
}
