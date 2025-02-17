import {FormProps} from "@/types/settingsFieldsTypes";

export const accountSettingsFormFields = [
  {
    formTitle: "Personal Basics",
    formData: [
      {
        fieldTitle: "Full Name",
        fieldDescription: "Your display name",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "firstName",
            placeholder: "John Doe",
            type: "text",
            name: "firstName",
          },
        ],
      },
      {
        fieldTitle: "Username",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "username",
            placeholder: "johndoe",
            type: "text",
            name: "username",
            disabled: true,
          },
        ],
      },
      {
        fieldTitle: "Pronouns (Optional)",
        fieldType: "dropdown",
        fieldInputProps: [
          {
            id: "pronouns",
            placeholder: "He/Him",
            type: "text",
            name: "pronouns",
          },
        ],
      },
      {
        fieldTitle: "Age (Optional)",
        fieldType: "number",
        fieldInputProps: [
          {
            id: "age",
            placeholder: "23",
            type: "number",
            name: "age",
          },
        ],
      },
      {
        fieldTitle: "Profile Picture",
        fieldDescription: "This photo will be visible to others",
        fieldType: "image",
        fieldInputProps: [
          {
            id: "profilePicture",
            placeholder: "Profile Picture",
            type: "file",
            name: "profilePicture",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Professional Overview",
    formData: [
      {
        fieldTitle: "Current Role",
        fieldDescription: "Your primary focus or expertise",
        fieldType: "text",
        fieldInputProps: [
          {
            id: "currentRole",
            placeholder: "Data Analytics",
            type: "text",
            name: "currentRole",
          },
        ],
      },
    ],
  },
] as FormProps[];
