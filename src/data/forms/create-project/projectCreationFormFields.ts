import {FormProps} from "@/types/settingsFieldsTypes";

export const projectCreationFormFields = [
  {
    formTitle: "Project Basics",
    formData: [
      {
        fieldTitle: "Name",
        fieldType: "text",
        fieldRequired: true,
        fieldDescription: "What is this project about?",
        fieldInputProps: [
          {
            id: "name",
            placeholder: "Innovative Web App",
            type: "text",
            name: "name",
          },
        ],
      },
      {
        fieldTitle: "Slug",
        fieldType: "text",
        fieldRequired: true,
        fieldDescription: "Used to identify the project in the URL",
        fieldInputProps: [
          {
            id: "slug",
            placeholder: "innovative-web-app",
            type: "text",
            name: "slug",
          },
        ],
      },
      {
        fieldTitle: "Tagline",
        fieldType: "text",
        fieldRequired: true,
        fieldDescription: "A short tagline that describes the project",
        fieldInputProps: [
          {
            id: "tagline",
            placeholder: "Connect creators with powerful AI tools",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Description",
        fieldType: "textarea",
        fieldRequired: true,
        fieldDescription: "What is this project about?",
        fieldInputProps: [
          {
            id: "description",
            placeholder: "Write a description for your project",
            type: "text",
            name: "description",
          },
        ],
      },
      {
        fieldTitle: "Image",
        fieldType: "image",
        fieldRequired: true,
        fieldDescription: "This photo will be visible to others",
        fieldInputProps: [
          {
            id: "projectImage",
            type: "text",
            name: "projectImage",
          },
        ],
      },
      {
        fieldTitle: "Background Image",
        fieldType: "image",
        fieldRequired: false,
        fieldDescription: "This photo will be visible to others",
        fieldInputProps: [
          {
            id: "backgroundImage",
            type: "text",
            name: "backgroundImage",
          },
        ],
      },
      {
        fieldTitle: "Category",
        fieldType: "selectWithSearch",
        fieldRequired: true,
        fieldDescription: "Choose the category that best fits your project",
        fieldInputProps: [
          {
            id: "category",
            placeholder: "Select a category",
            type: "text",
            name: "category",
            options: [
              {title: "Web Development"},
              {title: "Non-Profit"},
              {title: "Health"},
              {title: "Cybersecurity"},
            ],
          },
        ],
      },
    ],
  },
] as FormProps[];
