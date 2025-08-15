import {ProfileFormFieldProps} from "@/types/profileFieldTypes";
import React from "react";
import ExpendedDescription from "./ExpandedDescription";
import TagsList from "./TagsList";
import {MatchMeUser} from "@/types/user/matchMeUser";
import ProfileDetails from "./ProfileDetails";

const fieldComponents = {
  description: ExpendedDescription,
  tags: TagsList,
  details: ProfileDetails,
};

// Helper function to check if user has content for a specific field
const hasFieldContent = (
  user: MatchMeUser,
  formField: ProfileFormFieldProps,
  skills: {
    name: string;
    image_url?: string;
  }[],
): boolean => {
  const {fieldType, fieldInputProps} = formField;

  if (fieldType === "details") {
    // For details, check if user has any of the detail fields
    const detailFields = [
      "public_current_role",
      "looking_for",
      "years_of_experience",
      "seniority_level",
      "languages",
      "location",
      "pronouns",
      "personal_website",
      "time_commitment",
      "age",
    ];
    return detailFields.some((field) => {
      const value = user[field as keyof MatchMeUser];
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    });
  }

  if (fieldType === "tags") {
    // For skills/tags, check if user has skills
    return skills && skills.length > 0;
  }

  if (fieldType === "description" && fieldInputProps?.[0]?.id) {
    // For description fields (about_you, goal, dream), check if user has content
    const fieldId = fieldInputProps[0].id;
    const value = user[fieldId as keyof MatchMeUser];
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  return true; // Default to showing the field if we can't determine
};

const ProfileFormField = ({
  formField,
  user,
  skills,
}: {
  formField: ProfileFormFieldProps;
  user: MatchMeUser;
  skills: {
    name: string;
    image_url?: string;
  }[];
}) => {
  // Check if the user has content for this field
  if (!hasFieldContent(user, formField, skills)) {
    return null;
  }

  const {fieldTitle, fieldDescription, fieldType} = formField;
  const InputComponent = fieldComponents[fieldType as keyof typeof fieldComponents];
  return (
    <div className="flex max-[990px]:flex-col justify-between items-start gap-8 max-[990px]:gap-3">
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">{fieldTitle}</p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">{fieldDescription}</p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px]">
        <InputComponent
          user={user}
          id={formField.fieldInputProps?.[0]?.id ?? ""}
          maxNmberOfLines={formField.fieldInputProps?.[0]?.maxNmberOfLines ?? 0}
          skills={skills}
        />
      </div>
    </div>
  );
};

export default ProfileFormField;
