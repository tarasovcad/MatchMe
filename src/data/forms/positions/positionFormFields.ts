import {experienceLevels} from "@/data/projects/experienceLevels";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {PositionFormProps} from "@/types/positionFieldsTypes";

const positionStatuses = [
  {title: "Open", value: "open"},
  {title: "Closed", value: "closed"},
  {title: "Draft", value: "draft"},
];

export const positionFormFields = [
  {
    formTitle: "Position Basics",
    formDescription: "Essential information about the position",
    formData: [
      {
        fieldTitle: "Position Title",
        fieldDescription: "The job title for this position",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "title",
            placeholder: "Software Engineer",
            type: "text",
            name: "title",
          },
        ],
      },
      {
        fieldTitle: "Description",
        fieldDescription: "Detailed description of the role and responsibilities",
        fieldType: "textarea",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "description",
            placeholder:
              "We're looking for a passionate Software Engineer to join our engineering team...",
            type: "text",
            name: "description",
          },
        ],
      },
      {
        fieldTitle: "Requirements",
        fieldDescription: "List the key requirements for this position",
        fieldType: "textarea",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "requirements",
            placeholder:
              "3+ years of software development experience\nProficiency in React, Node.js, and TypeScript...",
            type: "text",
            name: "requirements",
          },
        ],
      },
      {
        fieldTitle: "Required Skills",
        fieldDescription: "Technical skills needed for this position",
        fieldType: "tags",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "required_skills",
            placeholder: "Add a skill",
            type: "text",
            name: "required_skills",
          },
        ],
      },
      {
        fieldTitle: "Experience Level",
        fieldDescription: "Required experience level for this position",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "experience_level",
            placeholder: "Select experience level",
            type: "text",
            name: "experience_level",
            options: experienceLevels,
          },
        ],
      },
      {
        fieldTitle: "Time Commitment",
        fieldDescription: "Expected time commitment for this position",
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
        fieldTitle: "Position Status",
        fieldDescription: "Current status of this position",
        fieldType: "dropdown",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "status",
            placeholder: "Select status",
            type: "text",
            name: "status",
            options: positionStatuses,
          },
        ],
      },
    ],
  },
] as PositionFormProps[];
