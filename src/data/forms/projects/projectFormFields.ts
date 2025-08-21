export const projectFormFields = [
  {
    fieldTitle: "About Us",
    fieldDescription: "",
    fieldType: "text",
    columnIfCharsAtLeast: 800,
    fieldInputProps: [
      {
        id: "description",
      },
    ],
  },
  {
    fieldTitle: "Why join?",
    fieldDescription: "What makes this project unique and what contributors will gain",
    fieldType: "text",
    fieldInputProps: [
      {
        id: "why_join",
      },
    ],
  },
  {
    fieldTitle: "Technology Stack",
    fieldDescription: "The frameworks and tools powering this project",
    fieldType: "skills",
    fieldInputProps: [
      {
        id: "skills",
      },
    ],
  },
  {
    fieldTitle: "Overview",
    fieldDescription: "What the project is & where it stands",
    fieldType: "details",
    fieldInputProps: [
      {
        id: "overview_section",
      },
    ],
  },
  {
    fieldTitle: "Team & Operations",
    fieldDescription: "How collaboration is structured",
    fieldType: "details",
    fieldInputProps: [
      {
        id: "team_operations_section",
      },
    ],
  },
  {
    fieldTitle: "Funding & Compensation",
    fieldDescription: "Financials & contributor incentives",
    fieldType: "details",
    fieldInputProps: [
      {
        id: "funding_compensation_section",
      },
    ],
  },
] as ProjectFormFieldProps[];

export const projectDetailsSections = [
  {
    id: "overview_section",
    fields: [
      {title: "Project Category", value: "category"},
      {title: "Target Audience", value: "target_audience"},
      {title: "Current Stage", value: "current_stage"},
      {title: "Expected Timeline", value: "expected_timeline"},
      {title: "Project Website", value: "project_website"},
      {title: "Collaboration Model", value: "collaboration_model"},
      {title: "Language Proficiency", value: "language_proficiency"},
    ],
  },
  {
    id: "team_operations_section",
    fields: [
      {title: "Time Commitment", value: "time_commitment"},
      {title: "Collaboration Model", value: "collaboration_model"},
      {title: "Collaboration Style", value: "collaboration_style"},
      {title: "Communication Tools", value: "community_platforms"},
    ],
  },
  {
    id: "funding_compensation_section",
    fields: [
      {title: "Revenue Expectations", value: "revenue_expectations"},
      {title: "Funding & Investment", value: "funding_investment"},
      {title: "Compensation Model", value: "compensation_model"},
    ],
  },
] as ProjectDetailsSectionProps[];

export interface ProjectFormFieldProps {
  fieldTitle: string;
  fieldDescription: string;
  fieldType: "text" | "details" | "description" | "skills";
  layout?: "row" | "column";
  // If set, switch to column layout when content length >= this number (for text/description)
  columnIfCharsAtLeast?: number;
  fieldInputProps: [
    {
      id: string;
      maxNmberOfLines?: number;
    },
  ];
}

export interface ProjectDetailsSectionProps {
  id: string;
  fields: {
    title: string;
    value: string;
  }[];
}
