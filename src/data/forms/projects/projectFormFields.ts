export const projectFormFields = [
  {
    fieldTitle: "About Us",
    fieldDescription: "",
    fieldType: "text",
    layout: "column",
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
  // {
  //   fieldTitle: "Open Positions",
  //   fieldDescription: "Current open positions in the project",
  //   fieldType: "open_positions",
  //   layout: "column",
  // },
] as ProjectFormFieldProps[];

export const projectDetailsSections = [
  {
    id: "overview_section",
    fields: [
      {title: "Project Category", value: "project_category"},
      {title: "Target Audience", value: "target_audience"},
      {title: "Current Stage", value: "current_stage"},
      {title: "Collaboration Model", value: "collaboration_model"},
      {title: "Language Proficiency", value: "language_proficiency"},
    ],
  },
  {
    id: "team_operations_section",
    fields: [
      {title: "Engagement Model", value: "engagement_model"},
      {title: "Working Hours", value: "working_hours"},
      {title: "Availability", value: "availability"},
      {title: "Community & Communication Tools", value: "communication_tools"},
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
