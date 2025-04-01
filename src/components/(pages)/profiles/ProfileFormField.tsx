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

const ProfileFormField = ({
  formField,
  user,
  skills,
}: {
  formField: ProfileFormFieldProps;
  user: MatchMeUser;
  skills: {
    name: string;
    image_url: string;
  }[];
}) => {
  const {fieldTitle, fieldDescription, fieldType} = formField;

  const InputComponent =
    fieldComponents[fieldType as keyof typeof fieldComponents];
  return (
    <div className="flex max-[990px]:flex-col justify-between items-start gap-8 max-[990px]:gap-3">
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">{fieldTitle}</p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">
            {fieldDescription}
          </p>
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
