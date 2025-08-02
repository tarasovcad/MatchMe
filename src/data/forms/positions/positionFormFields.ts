import {experienceLevels} from "@/data/projects/experienceLevels";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {PositionFormProps} from "@/types/positionFieldsTypes";

const positionStatuses = [{title: "Open"}, {title: "Closed"}, {title: "Draft"}];

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
            id: "fullDescription",
            placeholder:
              "We're looking for a passionate Software Engineer to join our engineering team...",
            type: "text",
            name: "fullDescription",
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
            id: "requiredSkills",
            placeholder: "Add a skill",
            type: "text",
            name: "requiredSkills",
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
            id: "experienceLevel",
            placeholder: "Select experience level",
            type: "text",
            name: "experienceLevel",
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
            id: "timeCommitment",
            placeholder: "Select time commitment",
            type: "text",
            name: "timeCommitment",
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
