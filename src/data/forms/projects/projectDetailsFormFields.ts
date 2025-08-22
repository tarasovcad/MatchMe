import {FormFieldProps, FormProps} from "@/types/settingsFieldsTypes";
import {projectCategories} from "@/data/projects/projectCategories";
import {projectStages} from "@/data/projects/projectStages";
import {projectTargetAudiences} from "@/data/projects/projectTargetAudiences";
import {collaborationModels} from "@/data/projects/collaborationModels";
import {collaborationStyles} from "@/data/projects/collaborationStyles";
import {expectedTimelineOptions} from "@/data/projects/expectedTimelineOptions";
import {revenueExpectations} from "@/data/projects/revenueExpectations";
import {fundingInvestment} from "@/data/projects/fundingInvestment";
import {compensationModels} from "@/data/projects/compensationModels";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";

export const projectDetailsFormFields: FormProps[] = [
  {
    formTitle: "Project Info",
    formDescription: "Basic information about your project",
    formData: [
      {
        fieldTitle: "Name",
        fieldDescription: "Display name of your project visible to everyone",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "name",
            placeholder: "Project Name",
            type: "text",
            name: "name",
          },
        ],
      },
      {
        fieldTitle: "Tagline",
        fieldDescription: "Short one-sentence summary to spark interest",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "tagline",
            placeholder: "Awesome tagline",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Project Image",
        fieldDescription: "Primary image that represents your project",
        fieldType: "image",
        fieldInputProps: [
          {
            id: "project_image",
            placeholder: "",
            type: "text",
            name: "project_image",
          },
        ],
      },
    ],
  },
  {
    formTitle: "About Project",
    formDescription: "Describe what your project is about and who it is for",
    formData: [
      {
        fieldTitle: "Description",
        fieldDescription: "Explain the vision, goals, and scope of the project",
        fieldType: "textarea",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "description",
            placeholder: "Describe your project...",
            type: "text",
            name: "description",
          },
        ],
      },
      {
        fieldTitle: "Why Join",
        fieldDescription: "Highlight what makes this project exciting for collaborators",
        fieldType: "textarea",
        fieldInputProps: [
          {
            id: "why_join",
            placeholder: "Why should others join?",
            type: "text",
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
        fieldDescription: "Choose the category that best fits your project",
        fieldType: "selectWithSearch",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "category",
            placeholder: "Select category",
            type: "text",
            name: "category",
            options: projectCategories,
          },
        ],
      },
      {
        fieldTitle: "Current Stage",
        fieldDescription: "What stage is your project currently in?",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "current_stage",
            placeholder: "Select stage",
            type: "text",
            name: "current_stage",
            options: projectStages,
          },
        ],
      },
      {
        fieldTitle: "Expected Timeline",
        fieldDescription: "How long do you expect this project to take?",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "expected_timeline",
            placeholder: "Select expected timeline",
            type: "text",
            name: "expected_timeline",
            options: expectedTimelineOptions,
          },
        ],
      },
      {
        fieldTitle: "Target Audience",
        fieldDescription: "Specify who will benefit from or use your project",
        fieldType: "selectWithSearch",
        fieldInputProps: [
          {
            id: "target_audience",
            placeholder: "Select audience",
            type: "text",
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
    formTitle: "Tech & Team",
    formDescription: "Technologies and collaboration preferences",
    formData: [
      {
        fieldTitle: "Language Proficiency",
        fieldDescription: "What languages should teammates be proficient in?",
        fieldType: "tags",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "language_proficiency",
            placeholder: "Add language",
            type: "text",
            name: "language_proficiency",
          },
        ],
      },
      {
        fieldTitle: "Technology Stack",
        fieldDescription: "Technologies, frameworks, and tools used in your project",
        fieldType: "tags",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "technology_stack",
            placeholder: "Add technology",
            type: "text",
            name: "technology_stack",
          },
        ],
      },
      {
        fieldTitle: "Collaboration Model",
        fieldDescription: "How will team members collaborate on this project?",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "collaboration_model",
            placeholder: "Select collaboration model",
            type: "text",
            name: "collaboration_model",
            options: collaborationModels,
          },
        ],
      },
      {
        fieldTitle: "Collaboration Style",
        fieldDescription: "How do you prefer to communicate and coordinate with your team?",
        fieldType: "dropdown",

        fieldInputProps: [
          {
            id: "collaboration_style",
            placeholder: "Select collaboration style",
            type: "text",
            name: "collaboration_style",
            options: collaborationStyles,
          },
        ],
      },
      {
        fieldTitle: "Time Commitment",
        fieldDescription: "Approximate weekly hours required for contributors",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "time_commitment",
            placeholder: "Select time commitment",
            type: "text",
            name: "time_commitment",
            options: timeCommitment,
          },
        ],
      },
      {
        fieldTitle: "Community Platforms",
        fieldDescription: "Where your team collaborates (Discord, Slack etc.)",
        fieldType: "tags",
        fieldInputProps: [
          {
            id: "community_platforms",
            placeholder: "Discord, Slack",
            type: "text",
            name: "community_platforms",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Financial",
    formDescription: "Monetary aspects of your project",
    formData: [
      {
        fieldTitle: "Revenue Expectations",
        fieldDescription: "Projected earnings or monetisation outlook",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "revenue_expectations",
            placeholder: "Select revenue expectations",
            type: "text",
            name: "revenue_expectations",
            options: revenueExpectations,
          },
        ],
      },
      {
        fieldTitle: "Funding & Investment",
        fieldDescription: "Current funding status or investment goals",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "funding_investment",
            placeholder: "Select funding",
            type: "text",
            name: "funding_investment",
            options: fundingInvestment,
          },
        ],
      },
      {
        fieldTitle: "Compensation Model",
        fieldDescription: "How contributors will be rewarded",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "compensation_model",
            placeholder: "Select compensation model",
            type: "text",
            name: "compensation_model",
            options: compensationModels,
          },
        ],
      },
    ],
  },
  {
    formTitle: "Boost Discoverability (Optional)",
    formDescription:
      "These tags help more people find your project. Only for reach and popularity.",
    formData: [
      {
        fieldTitle: "Tags",
        fieldDescription:
          "These tags help more people find your project. Only for reach and popularity.",
        fieldType: "tags",
        fieldInputProps: [
          {
            id: "tags",
            placeholder: "Add a tag",
            type: "text",
            name: "tags",
          },
        ],
      },
    ],
  },
];

export const projectDetailsFormFieldsTop: FormFieldProps[] = [
  {
    fieldTitle: "Make Project Public",
    fieldDescription: "Enable to make your project visible to others",
    fieldType: "makePublic",
    fieldInputProps: [
      {
        id: "is_project_public",
        placeholder: "Make Project Public",
        type: "text",
        name: "is_project_public",
      },
    ],
  },
];
