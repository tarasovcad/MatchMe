import {FormProps} from "@/types/settingsFieldsTypes";

export const securitySettingsFormFields = [
  {
    formTitle: "Security",
    formData: [
      {
        fieldTitle: "Email",
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
        fieldType: "username",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "username",
            placeholder: "johndoe",
            // readOnly: true,
            type: "text",
            name: "username",
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
