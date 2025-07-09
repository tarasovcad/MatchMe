import {Option} from "@/components/shadcn/multiselect";

export interface FormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType:
    | "text"
    | "slug"
    | "select"
    | "selectWithSearch"
    | "number"
    | "dropdown"
    | "image"
    | "textarea"
    | "tags"
    | "slider"
    | "webiste"
    | "social"
    | "description"
    | "accountVerification"
    | "makeProfilePublic"
    | "deleteAccount"
    | "connectedAccounts";
  fieldRequired?: boolean;
  fieldRequiredCreateProject?: boolean;
  fieldInputProps: [
    {
      id: string;
      placeholder: string;
      type: string;
      name: string;
      readOnly?: boolean;
      className?: string;
      disabled?: boolean;
      tags?: Option[];
      socials?: SocialOption[];
      options?: DropdownOption[];
    },
  ];
}

export interface FormProps {
  formTitle: string;
  formDescription: string;
  formData: FormFieldProps[];
}

export interface DropdownOption {
  title: string;
  description?: string;
}

export interface SocialOption {
  title: string;
  url?: string;
}
