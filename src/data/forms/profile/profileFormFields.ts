import {ProfileFormFieldProps} from "@/types/profileFieldTypes";

export const profileFormFields = [
  {
    fieldTitle: "About me",
    fieldDescription: "My background and biography",
    fieldType: "description",
    fieldInputProps: [
      {
        id: "about_you",
        maxNmberOfLines: 9,
      },
    ],
  },
  {
    fieldTitle: "Details",
    fieldDescription: "My background and biography",
    fieldType: "details",
  },
  {
    fieldTitle: "Current Goal",
    fieldDescription: "Current professional aspirations or next steps in your career.",
    fieldType: "description",
    fieldInputProps: [
      {
        id: "goal",
        maxNmberOfLines: 9,
      },
    ],
  },
  {
    fieldTitle: "Skills",
    fieldDescription: "Main Skills",
    fieldType: "tags",
  },
] as ProfileFormFieldProps[];
