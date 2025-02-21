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
            options: [
              {
                title: "He/Him",
              },
              {
                title: "She/Her",
              },
              {
                title: "They/Them",
              },
            ],
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
      {
        fieldTitle: "Looing for",
        fieldDescription: "Let others know what you’re looking for",
        fieldType: "select",
        fieldInputProps: [
          {
            id: "lookingFor",
            placeholder: "I'm looking for a new job",
            type: "text",
            name: "lookingFor",
            options: [
              {
                title: "Team Member",
                description: "Contribute your skills to an existing team",
              },
              {
                title: "Co-Founder",
                description: "Partner to launch and grow a startup",
              },
              {
                title: "Startups",
                description: "Open to contributing to existing startups",
              },
            ],
          },
        ],
      },
    ],
  },
] as FormProps[];
