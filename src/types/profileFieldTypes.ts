export interface ProfileFormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType: "description" | "tags";
  fieldInputProps: [
    {
      id: string;
      maxNmberOfLines: number;
    },
  ];
}
