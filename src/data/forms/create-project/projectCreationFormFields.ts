import {FormProps} from "@/types/settingsFieldsTypes";
import {projectCategories} from "./projectCategories";
import {projectStages} from "./projectStages";
import {projectTargetAudiences} from "@/data/projects/projectTargetAudiences";
import {collaborationModels} from "./collaborationModels";
import {engagementModels} from "./engagementModels";
import {availabilityOptions} from "./availabilityOptions";
import {revenueExpectations} from "./revenueExpectations";
import {fundingInvestment} from "./fundingInvestment";
import {compensationModels} from "./compensationModels";

export const projectCreationFormFields = [
  {
    formTitle: "Let's bring your project to life!",
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
            placeholder: "Smart Recipe Assistant",
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
            placeholder: "smart-recipe-assistant",
            type: "text",
            name: "slug",
          },
        ],
      },
      {
        fieldTitle: "Tagline",
        fieldType: "text",
        fieldRequired: true,
        fieldDescription: "Write a compelling description that explains what your project does",
        fieldInputProps: [
          {
            id: "tagline",
            placeholder: "AI-powered cooking companion for healthy meals",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Image",
        fieldType: "image",
        fieldRequired: false,
        fieldDescription: "This image will represent your project to others",
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
    formTitle: "Tell Your Story & Define Your Space",
    formDescription: "Share what your project is all about, why it matters, and who it's for",
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
      {
        fieldTitle: "Why join?",
        fieldType: "textarea",
        fieldRequired: false,
        fieldDescription:
          "Explain what makes your project exciting and why others should collaborate with you",
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
        fieldTitle: "Project Website",
        fieldDescription: "If you have a project website enter its URL here",
        fieldType: "webiste",
        fieldInputProps: [
          {
            id: "project_website",
            placeholder: "example.com",
            type: "text",
            name: "project_website",
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
        fieldTitle: "Targer Audience",
        fieldType: "selectWithSearch",

        fieldDescription: "Who is your project for?",
        fieldInputProps: [
          {
            id: "target_audience",
            type: "text",
            placeholder: "Select a target audience",
            name: "target_audience",
            options: projectTargetAudiences,
          },
        ],
      },
      {
        fieldTitle: "Demo Images",
        fieldType: "demo",
        fieldRequired: false,
        fieldDescription: "Upload up to 5 images to showcase your project",
        fieldInputProps: [
          {
            id: "demo",
            name: "demo",
          },
        ],
      },
    ],
  },
  {
    formTitle: "What Skills Power Your Project?",
    formDescription: "Choose the technologies and languages your project is built with",
    formData: [
      {
        fieldTitle: "Language Proficiency",
        fieldType: "tags",
        fieldRequired: true,
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
        fieldDescription: "Technologies, frameworks, and tools used in your project",
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
  {
    formTitle: "How Will Your Team Work Together?",
    formDescription: "Define your team's structure, commitment, and communication preferences",
    formData: [
      {
        fieldTitle: "Collaboration Model",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "How will team members collaborate on this project?",
        fieldInputProps: [
          {
            id: "collaboration_model",
            type: "text",
            placeholder: "Select collaboration model",
            name: "collaboration_model",
            options: collaborationModels,
          },
        ],
      },
      {
        fieldTitle: "Engagement Model",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "How do you envision team members engaging with the project?",
        fieldInputProps: [
          {
            id: "engagement_model",
            type: "text",
            placeholder: "Select engagement model",
            name: "engagement_model",
            options: engagementModels,
          },
        ],
      },
      {
        fieldTitle: "Time Commitment",
        fieldType: "text",
        fieldRequired: false,
        fieldDescription: "Specify the expected weekly time commitment for team members",
        fieldInputProps: [
          {
            id: "working_hours",
            type: "text",
            placeholder: "10-15 hours per week",
            name: "working_hours",
          },
        ],
      },
      {
        fieldTitle: "Availability",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "Current availability status for new team members",
        fieldInputProps: [
          {
            id: "availability",
            type: "text",
            placeholder: "Select availability",
            name: "availability",
            options: availabilityOptions,
          },
        ],
      },
      {
        fieldTitle: "Communication Tools",
        fieldType: "tags",
        fieldRequired: false,
        fieldDescription: "Tools your team uses for communication (Slack, Discord, etc.)",
        fieldInputProps: [
          {
            id: "community_platforms",
            type: "text",
            placeholder: "Add a communication tool",
            name: "community_platforms",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Compensation & Funding",
    formDescription: "Define the financial aspects and compensation structure for your project",
    formData: [
      {
        fieldTitle: "Revenue Expectations",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "What are your revenue expectations for this project?",
        fieldInputProps: [
          {
            id: "revenue_expectations",
            type: "text",
            placeholder: "Select revenue expectation",
            name: "revenue_expectations",
            options: revenueExpectations,
          },
        ],
      },
      {
        fieldTitle: "Funding & Investment",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "What's your current funding situation?",
        fieldInputProps: [
          {
            id: "funding_investment",
            type: "text",
            placeholder: "Select funding status",
            name: "funding_investment",
            options: fundingInvestment,
          },
        ],
      },
      {
        fieldTitle: "Compensation Model",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldDescription: "How will team members be compensated?",
        fieldInputProps: [
          {
            id: "compensation_model",
            type: "text",
            placeholder: "Select compensation model",
            name: "compensation_model",
            options: compensationModels,
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
