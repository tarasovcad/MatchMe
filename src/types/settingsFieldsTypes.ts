export interface FormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType:
    | "text"
    | "select"
    | "number"
    | "dropdown"
    | "image"
    | "textarea"
    | "tags"
    | "slider";
  fieldRequired?: boolean;
  fieldInputProps: [
    {
      id: string;
      placeholder: string;
      type: string;
      name: string;
      className?: string;
      disabled?: boolean;
      options?: DropdownOption[];
    },
  ];
}

export interface FormProps {
  formTitle: string;
  formData: FormFieldProps[];
}

export interface DropdownOption {
  title: string;
  description?: string;
}
