import {FormProps} from "@/types/settingsFieldsTypes";

export const projectSecurityFormFields = [
  {
    formTitle: "Project Security",
    formData: [
      // {
      //   fieldTitle: "Email",
      //   fieldType: "text",
      //   fieldRequired: true,
      //   fieldInputProps: [
      //     {
      //       id: "email",
      //       placeholder: "johndoe@example.com",
      //       type: "email",
      //       name: "email",
      //       readOnly: true,
      //     },
      //   ],
      // },
      {
        fieldTitle: "Slug",
        fieldType: "slug",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "slug",
            placeholder: "johndoe",
            // readOnly: true,
            type: "text",
            name: "slug",
          },
        ],
      },
      // {
      //   fieldTitle: "Danger Zone",
      //   fieldDescription: "Deleting your account is irreversible",
      //   fieldType: "deleteAccount",
      //   fieldInputProps: [
      //     {
      //       id: "deleteAccount",
      //       name: "deleteAccount",
      //     },
      //   ],
      // },
    ],
  },
] as FormProps[];
