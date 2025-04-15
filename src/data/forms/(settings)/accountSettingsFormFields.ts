import {FormFieldProps, FormProps} from "@/types/settingsFieldsTypes";
import {languages} from "./languages";
import {socialLinks} from "./socialLinks";

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
            id: "profileImage",
            placeholder: "Profile Picture",
            type: "file",
            name: "profileImage",
          },
        ],
      },
      {
        fieldTitle: "Background Image",
        fieldDescription: "This backgound will be visible to others",
        fieldType: "image",
        fieldInputProps: [
          {
            id: "backgroundImage",
            placeholder: "Background Image",
            type: "file",
            name: "backgroundImage",
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
        fieldTitle: "Goal",
        fieldDescription:
          "Describe your current professional aspirations or next steps in your career.",
        fieldType: "textarea",
        fieldInputProps: [
          {
            id: "goal",
            placeholder: "I want to be a...",
            type: "text",
            name: "goal",
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
        fieldDescription: "Your main skills (up  to 15)",
        fieldType: "tags",
        fieldInputProps: [
          {
            id: "skills",
            placeholder: "Add a skill",
            type: "text",
            name: "skills",
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
        fieldTitle: "Location",
        fieldType: "selectWithSearch",
        fieldDescription: "Your current location",
        fieldInputProps: [
          {
            id: "location",
            placeholder: "Select your location",
            type: "text",
            name: "location",
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
            placeholder: "Add a language",
            type: "text",
            name: "languages",
            tags: languages,
          },
        ],
      },
      {
        fieldTitle: "About you",
        fieldDescription: "Write a description for your profile",
        fieldType: "textarea",
        fieldInputProps: [
          {
            id: "about_you",
            placeholder: "Write a description for your profile",
            type: "text",
            name: "about_you",
          },
        ],
      },
      {
        fieldTitle: "Personal Website",
        fieldDescription: "If you have a personal website enter its URL here",
        fieldType: "webiste",
        fieldInputProps: [
          {
            id: "personal_website",
            placeholder: "example.com",
            type: "text",
            name: "personal_website",
          },
        ],
      },
      {
        fieldTitle: "Social Links",
        fieldDescription: "Add links to your professional social media profiles",
        fieldType: "social",
        fieldInputProps: [
          {
            id: "social_links",
            placeholder: "example.com",
            type: "text",
            name: "social_links",
            socials: [
              {
                title: "x.com/",
              },
              {
                title: "github.com/",
              },
              {
                title: "linkedin.com/",
              },
            ],
            options: socialLinks,
          },
        ],
      },
    ],
  },
] as FormProps[];

export const accountSettingsFormFieldsTop = [
  {
    fieldTitle: "Make Profile Public",
    fieldDescription: "Enable to make your profile visible to others",
    fieldType: "makeProfilePublic",
    fieldInputProps: [
      {
        id: "is_profile_public",
        placeholder: "Make Profile Public",
        type: "text",
        name: "is_profile_public",
      },
    ],
  },
  {
    fieldTitle: "Account Verification",
    fieldDescription: "Verify your account to gain trust and visibility.",
    fieldType: "accountVerification",
    fieldInputProps: [
      {
        id: "is_profile_verified",
        placeholder: "Account Verification",
        type: "text",
        name: "is_profile_verified",
      },
    ],
  },
] as FormFieldProps[];
