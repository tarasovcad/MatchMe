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
            name: "projectImage",
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
      {
        fieldTitle: "Current Stage",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "What stage is your project currently in?",
        fieldInputProps: [
          {
            id: "currentStage",
            type: "text",
            placeholder: "Select a stage",
            name: "currentStage",
            options: [
              {title: "Idea"},
              {title: "Prototype"},
              {title: "MVP"},
              {title: "Beta"},
              {title: "Live"},
            ],
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
            id: "whyJoin",
            type: "text",
            placeholder: "Share your vision and why people should join",
            name: "whyJoin",
          },
        ],
      },
      {
        fieldTitle: "Language Proficiency",
        fieldType: "tags",
        fieldRequired: true,
        fieldDescription: "What languages should teammates be proficient in?",
        fieldInputProps: [
          {
            id: "languageProficiency",
            type: "text",
            placeholder: "Add a language",
            name: "languageProficiency",
          },
        ],
      },
      {
        fieldTitle: "Technology Stack",
        fieldType: "tags",
        fieldRequired: true,
        fieldDescription: "What technologies are you using?",
        fieldInputProps: [
          {
            id: "technologyStack",
            type: "text",
            placeholder: "Add a technology",
            name: "technologyStack",
          },
        ],
      },
      {
        fieldTitle: "Project Timeline",
        fieldType: "text",
        fieldRequired: false,
        fieldDescription: "Project duration or key phases",
        fieldInputProps: [
          {
            id: "projectTimeline",
            type: "text",
            placeholder: "6 months to launch",
            name: "projectTimeline",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Collaboration & Roles",
    formData: [
      {
        fieldTitle: "Collaboration Model",
        fieldType: "select",
        fieldRequired: true,
        fieldDescription: "Choose the collaboration model that best fits your project",
        fieldInputProps: [
          {
            id: "collaborationModel",
            type: "text",
            placeholder: "Select a collaboration model",
            name: "collaborationModel",
            options: [
              {title: "Collaboration"},
              {title: "Partnership"},
              {title: "Internship Collaboration"},
            ],
          },
        ],
      },
      {
        fieldTitle: "Engagement Model",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "Choose the engagement model that best fits your project",
        fieldInputProps: [
          {
            id: "engagementModel",
            type: "text",
            placeholder: "Select an engagement model",
            name: "engagementModel",
            options: [{title: "Part-time"}, {title: "Full-time"}, {title: "Contract-based"}],
          },
        ],
      },
      {
        fieldTitle: "Working Hours",
        fieldType: "slider",
        fieldRequired: true,
        fieldDescription: "How many hours do you expect to work per week?",
        fieldInputProps: [
          {
            id: "workingHours",
            name: "workingHours",
          },
        ],
      },
      {
        fieldTitle: "Availability",
        fieldType: "select",
        fieldRequired: true,
        fieldDescription: "Choose the availability that best fits your project",
        fieldInputProps: [
          {
            id: "availability",
            type: "text",
            placeholder: "Select an availability",
            name: "availability",
            options: [
              {title: "Open for applications"},
              {title: "Limited spots"},
              {title: "Closed"},
            ],
          },
        ],
      },
    ],
  },
  {
    formTitle: "Funding & Compensation",
    formData: [
      {
        fieldTitle: "Revenue Expectations",
        fieldType: "text",
        fieldRequired: true,
        fieldDescription: "What is your project's revenue expectation?",
        fieldInputProps: [
          {
            id: "revenueExpectations",
            type: "text",
            placeholder: "Expected earnings/revenue goals",
            name: "revenueExpectations",
          },
        ],
      },
      {
        fieldTitle: "Funding Model",
        fieldType: "select",
        fieldRequired: true,
        fieldDescription: "Choose the funding model that best fits your project",
        fieldInputProps: [
          {
            id: "fundingModel",
            type: "text",
            placeholder: "Select a funding model",
            name: "fundingModel",
            options: [
              {title: "Self-funded"},
              {title: "Bootstrapped"},
              {title: "Looking for Investors"},
            ],
          },
        ],
      },

      {
        fieldTitle: "Compensation Model",
        fieldType: "select",
        fieldRequired: true,
        fieldDescription: "Choose the compensation model that best fits your project",
        fieldInputProps: [
          {
            id: "compensationModel",
            type: "text",
            placeholder: "Select a compensation model",
            name: "compensationModel",
            options: [
              {title: "Equity-based"},
              {title: "Profit-share"},
              {title: "Fixed salary after funding"},
            ],
          },
        ],
      },
    ],
  },
] as FormProps[];
