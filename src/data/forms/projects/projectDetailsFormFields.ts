import {FormProps} from "@/types/settingsFieldsTypes";
import {projectCategories} from "@/data/forms/create-project/projectCategories";
import {projectStages} from "@/data/forms/create-project/projectStages";
import {projectTargetAudiences} from "@/data/projects/projectTargetAudiences";
import {collaborationModels} from "@/data/forms/create-project/collaborationModels";
import {engagementModels} from "@/data/forms/create-project/engagementModels";
import {availabilityOptions} from "@/data/forms/create-project/availabilityOptions";
import {revenueExpectations} from "@/data/forms/create-project/revenueExpectations";
import {fundingInvestment} from "@/data/forms/create-project/fundingInvestment";
import {compensationModels} from "@/data/forms/create-project/compensationModels";

export const projectDetailsFormFields: FormProps[] = [
  {
    formTitle: "Project Info",
    formDescription: "Basic information about your project",
    formData: [
      {
        fieldTitle: "Name",
        fieldDescription: "Public project name displayed across the platform",
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
        fieldTitle: "Slug",
        fieldDescription: "Unique identifier used in the project URL (lowercase & hyphens)",
        fieldType: "text",
        fieldRequired: true,

        fieldInputProps: [
          {
            id: "slug",
            placeholder: "project-slug",
            readOnly: true,
            type: "text",
            name: "slug",
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
        fieldDescription: "Primary image that represents your project (1:1 ratio recommended)",
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
  // {
  //   formTitle: "About Project",
  //   formDescription: "Describe what your project is about and who it is for",
  //   formData: [
  //     {
  //       fieldTitle: "Description",
  //       fieldDescription: "Explain the vision, goals, and scope of the project",
  //       fieldType: "textarea",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "description",
  //           placeholder: "Describe your project...",
  //           type: "text",
  //           name: "description",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Why Join",
  //       fieldDescription: "Highlight what makes this project exciting for collaborators",
  //       fieldType: "textarea",
  //       fieldInputProps: [
  //         {
  //           id: "why_join",
  //           placeholder: "Why should others join?",
  //           type: "text",
  //           name: "why_join",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Project Website",
  //       fieldDescription: "Link to an external landing page or documentation (optional)",
  //       fieldType: "webiste",
  //       fieldInputProps: [
  //         {
  //           id: "project_website",
  //           placeholder: "example.com",
  //           type: "text",
  //           name: "project_website",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Category",
  //       fieldDescription: "Choose the category that best fits your project",
  //       fieldType: "selectWithSearch",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "category",
  //           placeholder: "Select category",
  //           type: "text",
  //           name: "category",
  //           options: projectCategories,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Current Stage",
  //       fieldDescription: "Indicate your project’s current maturity level",
  //       fieldType: "dropdown",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "current_stage",
  //           placeholder: "Select stage",
  //           type: "text",
  //           name: "current_stage",
  //           options: projectStages,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Target Audience",
  //       fieldDescription: "Specify who will benefit from or use your project",
  //       fieldType: "selectWithSearch",
  //       fieldInputProps: [
  //         {
  //           id: "target_audience",
  //           placeholder: "Select audience",
  //           type: "text",
  //           name: "target_audience",
  //           options: projectTargetAudiences,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   formTitle: "Tech & Team",
  //   formDescription: "Technologies and collaboration preferences",
  //   formData: [
  //     {
  //       fieldTitle: "Language Proficiency",
  //       fieldDescription: "Languages that contributors should be comfortable with",
  //       fieldType: "tags",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "language_proficiency",
  //           placeholder: "Add language",
  //           type: "text",
  //           name: "language_proficiency",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Technology Stack",
  //       fieldDescription: "Frameworks, tools, and technologies powering your project",
  //       fieldType: "tags",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "technology_stack",
  //           placeholder: "Add technology",
  //           type: "text",
  //           name: "technology_stack",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Collaboration Model",
  //       fieldDescription: "How team members will work together (e.g., async, agile)",
  //       fieldType: "dropdown",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "collaboration_model",
  //           placeholder: "Select collaboration model",
  //           type: "text",
  //           name: "collaboration_model",
  //           options: collaborationModels,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Engagement Model",
  //       fieldDescription: "Expected level of commitment from collaborators",
  //       fieldType: "dropdown",
  //       fieldRequired: true,
  //       fieldInputProps: [
  //         {
  //           id: "engagement_model",
  //           placeholder: "Select engagement model",
  //           type: "text",
  //           name: "engagement_model",
  //           options: engagementModels,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Working Hours",
  //       fieldDescription: "Typical hours or timezone overlap for meetings (optional)",
  //       fieldType: "text",
  //       fieldInputProps: [
  //         {
  //           id: "working_hours",
  //           placeholder: "e.g. 10-20 hrs/week",
  //           type: "text",
  //           name: "working_hours",
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Availability",
  //       fieldDescription: "Approximate weekly hours required for contributors",
  //       fieldType: "dropdown",
  //       fieldInputProps: [
  //         {
  //           id: "availability",
  //           placeholder: "Select availability",
  //           type: "text",
  //           name: "availability",
  //           options: availabilityOptions,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Community Platforms",
  //       fieldDescription: "Where your team collaborates (Discord, Slack etc.)",
  //       fieldType: "tags",
  //       fieldInputProps: [
  //         {
  //           id: "community_platforms",
  //           placeholder: "Discord, Slack",
  //           type: "text",
  //           name: "community_platforms",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   formTitle: "Financial",
  //   formDescription: "Monetary aspects of your project",
  //   formData: [
  //     {
  //       fieldTitle: "Revenue Expectations",
  //       fieldDescription: "Projected earnings or monetisation outlook (optional)",
  //       fieldType: "dropdown",
  //       fieldInputProps: [
  //         {
  //           id: "revenue_expectations",
  //           placeholder: "Select revenue expectations",
  //           type: "text",
  //           name: "revenue_expectations",
  //           options: revenueExpectations,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Funding & Investment",
  //       fieldDescription: "Current funding status or investment goals",
  //       fieldType: "dropdown",
  //       fieldInputProps: [
  //         {
  //           id: "funding_investment",
  //           placeholder: "Select funding",
  //           type: "text",
  //           name: "funding_investment",
  //           options: fundingInvestment,
  //         },
  //       ],
  //     },
  //     {
  //       fieldTitle: "Compensation Model",
  //       fieldDescription: "How contributors will be rewarded (equity, paid, etc.)",
  //       fieldType: "dropdown",
  //       fieldInputProps: [
  //         {
  //           id: "compensation_model",
  //           placeholder: "Select compensation model",
  //           type: "text",
  //           name: "compensation_model",
  //           options: compensationModels,
  //         },
  //       ],
  //     },
  //   ],
  // },
];
