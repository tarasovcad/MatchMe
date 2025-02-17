export interface FormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType:
    | "text"
    | "dropdown"
    | "number"
    | "image"
    | "select"
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
    },
  ];
}

export interface FormProps {
  formTitle: string;
  formData: FormFieldProps[];
}
