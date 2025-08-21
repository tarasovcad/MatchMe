export interface ProfileFormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType: "description" | "tags" | "details";
  fieldInputProps?: [
    {
      id: string;
      maxNmberOfLines: number;
    },
  ];
}
