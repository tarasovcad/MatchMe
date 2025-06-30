import {FormProps} from "@/types/settingsFieldsTypes";
import {projectCategories} from "./projectCategories";
import {projectStages} from "./projectStages";

export const projectCreationFormFields = [
  {
    formTitle: "Let’s bring your project to life!",
    formDescription:
      "Tell us a bit about what you're building, how others can join, and what makes your project exciting.",
    formData: [
      {
        fieldTitle: "Name",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "name",
            placeholder: "AI-Powered Language Tutor",
            type: "text",
            name: "name",
          },
        ],
      },
      {
        fieldTitle: "Slug",
        fieldType: "slug",
        fieldRequired: true,
        fieldDescription: "Used to identify the project in the URL",
        fieldInputProps: [
          {
            id: "slug",
            placeholder: "ai-language-tutor",
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
            placeholder: "A platform for learning and growing together",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Image",
        fieldType: "image",
        fieldRequired: false,
        fieldDescription: "This image will represent your project to others.",
        fieldInputProps: [
          {
            id: "project_image",
            name: "project_image",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Project Details",
    formDescription: "Provide more details about your project vision and goals.",
    formData: [
      {
        fieldTitle: "Description",
        fieldType: "textarea",
        fieldRequired: true,
        fieldDescription: "Explain the vision, goals, and scope of the project",
        fieldInputProps: [
          {
            id: "description",
            placeholder: "Write a description for your project",
            type: "text",
            name: "description",
          },
        ],
      },
    ],
  },
  // Additional steps can be added here
] as FormProps[];

// Keep the full form fields for reference or future use
export const allProjectCreationFormFields = [
  {
    formTitle: "Project Basics",
    formDescription:
      "Tell us a bit about what you're building, how others can join, and what makes your project exciting.",
    formData: [
      {
        fieldTitle: "Name",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "name",
            placeholder: "AI-Powered Language Tutor",
            type: "text",
            name: "name",
          },
        ],
      },
      {
        fieldTitle: "Slug",
        fieldType: "slug",
        fieldRequired: true,
        fieldDescription: "Used to identify the project in the URL",
        fieldInputProps: [
          {
            id: "slug",
            placeholder: "ai-language-tutor",
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
            placeholder: "A platform for learning and growing together",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Description",
        fieldType: "textarea",
        fieldRequired: true,
        fieldDescription: "Explain the vision, goals, and scope of the project",
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
        fieldRequired: false,
        fieldDescription: "This image will represent your project to others.",
        fieldInputProps: [
          {
            id: "project_image",
            name: "project_image",
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
            options: projectCategories,
          },
        ],
      },
      {
        fieldTitle: "Current Stage",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "What stage is your project currently in?",
        fieldInputProps: [
          {
            id: "current_stage",
            type: "text",
            placeholder: "Select a stage",
            name: "current_stage",
            options: projectStages,
          },
        ],
      },
      {
        fieldTitle: "Why join?",
        fieldType: "textarea",
        fieldRequired: false,
        fieldDescription: "Tell others what makes this project exciting to join",
        fieldInputProps: [
          {
            id: "why_join",
            type: "text",
            placeholder: "Share your vision and why people should join",
            name: "why_join",
          },
        ],
      },
      {
        fieldTitle: "Language Proficiency",
        fieldType: "tags",
        fieldDescription: "What languages should teammates be proficient in?",
        fieldInputProps: [
          {
            id: "language_proficiency",
            type: "text",
            placeholder: "Add a language",
            name: "language_proficiency",
          },
        ],
      },
      {
        fieldTitle: "Technology Stack",
        fieldType: "tags",
        fieldRequired: true,
        fieldDescription: "Technologies being used in the project",
        fieldInputProps: [
          {
            id: "technology_stack",
            type: "text",
            placeholder: "Add a technology",
            name: "technology_stack",
          },
        ],
      },
    ],
  },
] as FormProps[];
