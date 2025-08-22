import {FormProps} from "@/types/settingsFieldsTypes";

export const projectSecurityFormFields = [
  {
    formTitle: "Project Security",
    formData: [
      {
        fieldTitle: "Slug",
        fieldType: "slug",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "slug",
            placeholder: "john-doe",
            type: "text",
            name: "slug",
          },
        ],
      },
      {
        fieldTitle: "Danger Zone",
        fieldDescription: "Deleting your project is irreversible",
        fieldType: "deleteProject",
        fieldInputProps: [
          {
            id: "deleteProject",
            name: "deleteProject",
          },
        ],
      },
      {
        fieldTitle: "Transfer Ownership",
        fieldDescription: "Transfer ownership of your project to another user",
        fieldType: "transferOwnership",
        fieldInputProps: [
          {
            id: "transferOwnership",
            name: "transferOwnership",
          },
        ],
      },
    ],
  },
] as FormProps[];
