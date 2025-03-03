import {FormProps} from "@/types/settingsFieldsTypes";

export const accountSettingsFormFields = [
  {
    formTitle: "Personal Basics",
    formData: [
      {
        fieldTitle: "Full Name",
        fieldDescription: "Your display name",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "firstName",
            placeholder: "John Doe",
            type: "text",
            name: "name",
          },
        ],
      },
      {
        fieldTitle: "Username",
        fieldType: "text",
        fieldRequired: true,
        fieldInputProps: [
          {
            id: "username",
            placeholder: "johndoe",
            readOnly: true,
            type: "text",
            name: "username",
          },
        ],
      },
      {
        fieldTitle: "Pronouns (Optional)",
        fieldType: "dropdown",
        fieldInputProps: [
          {
            id: "pronouns",
            placeholder: "He/Him",
            type: "text",
            name: "pronouns",
            options: [
              {
                title: "He/Him",
              },
              {
                title: "She/Her",
              },
              {
                title: "They/Them",
              },
            ],
          },
        ],
      },
      {
        fieldTitle: "Age (Optional)",
        fieldType: "number",
        fieldInputProps: [
          {
            id: "age",
            placeholder: "23",
            type: "number",
            name: "age",
          },
        ],
      },
      {
        fieldTitle: "Profile Picture",
        fieldDescription: "This photo will be visible to others",
        fieldType: "image",
        fieldInputProps: [
          {
            id: "profilePicture",
            placeholder: "Profile Picture",
            type: "file",
            name: "profilePicture",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Professional Overview",
    formData: [
      {
        fieldTitle: "Current Role",
        fieldDescription: "Your primary focus or expertise",
        fieldType: "text",
        fieldInputProps: [
          {
            id: "public_current_role",
            placeholder: "Data Analytics",
            type: "text",
            name: "public_current_role",
          },
        ],
      },
      {
        fieldTitle: "Looing for",
        fieldDescription: "Let others know what you’re looking for",
        fieldType: "select",
        fieldInputProps: [
          {
            id: "looking_for",
            placeholder: "I'm looking for a new job",
            type: "text",
            name: "looking_for",
            options: [
              {
                title: "Team Member",
                description: "Contribute your skills to an existing team",
              },
              {
                title: "Co-Founder",
                description: "Partner to launch and grow a startup",
              },
              {
                title: "Startups",
                description: "Open to contributing to existing startups",
              },
            ],
          },
        ],
      },
      {
        fieldTitle: "Goals",
        fieldDescription:
          "Describe your current professional aspirations or next steps in your career.",
        fieldType: "textarea",
        fieldInputProps: [
          {
            id: "goals",
            placeholder: "I want to be a...",
            type: "text",
            name: "goals",
          },
        ],
      },
      {
        fieldTitle: "Tagline",
        fieldDescription: "A short tagline that describes you",
        fieldType: "text",
        fieldInputProps: [
          {
            id: "tagline",
            placeholder: "Looking for my next entrepreneurial journey",
            type: "text",
            name: "tagline",
          },
        ],
      },
      {
        fieldTitle: "Skills",
        fieldDescription: "Your main skills (up  to 20)",
        fieldType: "tags",
        fieldInputProps: [
          {
            id: "skills",
            placeholder: "Select skills",
            type: "text",
            name: "skills",
            tags: [],
          },
        ],
      },
      {
        fieldTitle: "Work Availability",
        fieldDescription: "Specify how many hours you can work per week",
        fieldType: "slider",
        fieldInputProps: [
          {
            id: "work_availability",
            name: "work_availability",
          },
        ],
      },
    ],
  },
  {
    formTitle: "Personal Context",
    formData: [
      {
        fieldTitle: "Location & Timezone",
        fieldType: "dropdown",
        fieldInputProps: [
          {
            id: "location",
            placeholder: "London / British Time (UTC +0)",
            type: "text",
            name: "location",
            options: [
              {
                title: "London / British Time (UTC +0)",
              },
              {
                title: "New York / Eastern Time (UTC -5)",
              },
              {
                title: "Tokyo / Japan Standard Time (UTC +9)",
              },
              {
                title: "Sydney / Australian Time (UTC +10)",
              },
            ],
          },
        ],
      },
      {
        fieldTitle: "Languages Spoken",
        fieldDescription: "List the languages you speak",
        fieldType: "tags",
        fieldInputProps: [
          {
            id: "languages",
            placeholder: "Select languages",
            type: "text",
            name: "languages",
            tags: [
              {
                label: "English",
                value: "english",
              },
              {
                label: "Spanish",
                value: "spanish",
              },
              {
                label: "French",
                value: "french",
              },
              {
                label: "German",
                value: "german",
              },

              {
                label: "Italian",
                value: "italian",
              },
            ],
          },
        ],
      },
      {
        fieldTitle: "About you",
        fieldDescription: "Write a description for your profile",
        fieldType: "description",
        fieldInputProps: [
          {
            id: "about",
            placeholder: "Write a description for your profile",
            type: "text",
            name: "about",
          },
        ],
      },
      {
        fieldTitle: "Personal Website",
        fieldDescription: "If you have a personal website enter its URL here",
        fieldType: "webiste",
        fieldInputProps: [
          {
            id: "website",
            placeholder: "example.com",
            type: "text",
            name: "website",
          },
        ],
      },
      {
        fieldTitle: "Social Links",
        fieldDescription:
          "Add links to your professional social media profiles",
        fieldType: "social",
        fieldInputProps: [
          {
            id: "social",
            placeholder: "example.com",
            type: "text",
            name: "social",
            socials: [
              {
                value: "twitter.com/",
              },
              {
                value: "facebook.com/",
              },
              {
                value: "linkedin.com/company",
              },
            ],
          },
        ],
      },
    ],
  },
] as FormProps[];
