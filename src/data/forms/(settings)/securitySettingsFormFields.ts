import {FormProps} from "@/types/settingsFieldsTypes";

export const securitySettingsFormFields = [
  {
    formTitle: "Security",
    formData: [
      {
        fieldTitle: "Your Email",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "email",
            placeholder: "johndoe@example.com",
            type: "email",
            name: "email",

            readOnly: true,
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
            readOnly: true,
            type: "text",
            name: "username",
          },
        ],
      },
      {
        fieldTitle: "Delete My Account",
        fieldDescription: "if away for...",
        fieldType: "dropdown",
        fieldInputProps: [
          {
            id: "deleteIn",
            placeholder: "12 months",
            readOnly: true,
            type: "text",
            name: "deleteIn",
            options: [
              {
                title: "1 month",
              },
              {
                title: "6 months",
              },
              {
                title: "12 months",
              },
              {
                title: "24 months",
              },
            ],
          },
        ],
      },
      {
        fieldTitle: "Connected Accounts",
        fieldType: "connectedAccounts",
        fieldDescription:
          "Link your account to third-party services for easier access",
        fieldInputProps: [
          {
            id: "connectedAccounts",
            name: "connectedAccounts",
          },
        ],
      },
      {
        fieldTitle: "Danger Zone",
        fieldDescription: "Deleting your account is irreversible",
        fieldType: "deleteAccount",
        fieldInputProps: [
          {
            id: "deleteAccount",
            name: "deleteAccount",
          },
        ],
      },
    ],
  },
] as FormProps[];
