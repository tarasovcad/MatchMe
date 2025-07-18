"use client";
import React from "react";
import SimpleInput from "../form/SimpleInput";
import {FormFieldProps} from "@/types/settingsFieldsTypes";
import NumberFieldInput from "../form/NumberFieldInput";
import SelectInput from "../form/SelectInput";
import SettingsSelectField from "./SettingsSelectField";
import AutogrowingTextarea from "../form/AutogrowingTextarea";
import SimpleSlider from "../form/SimpleSlider";
import PersonalWebsiteInput from "../form/PersonalWebsiteInput";
import SocialLinksInput from "./SocialLinksInput";
import {useFormContext} from "react-hook-form";
import MakeProfilePublicSwitch from "./MakeProfilePublicSwitch";
import VerifyAccountButton from "./VerifyAccountButton";
import {cn} from "@/lib/utils";
import TagsInput from "../form/TagsInput";
import {motion} from "framer-motion";
import DangerZone from "./DangerZone";
import UserConnectedAccounts from "./UserConnectedAccounts";
import {User} from "@supabase/supabase-js";
import SettingsUsernameInput from "./SettingsUsernameInput";
import {MatchMeUser} from "@/types/user/matchMeUser";
import SelectInputWithSearch from "../form/SelectInputWithSearch";
import ImageTabs from "@/components/(pages)/settings/ImageTabs";
import DemoImageInput from "@/components/(pages)/dashboard/create-project/DemoImageInput";

const fieldComponents = {
  makeProfilePublic: MakeProfilePublicSwitch,
  accountVerification: VerifyAccountButton,
  text: SimpleInput,
  number: NumberFieldInput,
  image: ImageTabs,
  dropdown: SelectInput,
  select: SettingsSelectField,
  selectWithSearch: SelectInputWithSearch,
  textarea: AutogrowingTextarea,
  tags: TagsInput,
  slider: SimpleSlider,
  webiste: PersonalWebsiteInput,
  social: SocialLinksInput,
  deleteAccount: DangerZone,
  connectedAccounts: UserConnectedAccounts,
  username: SettingsUsernameInput,
  demo: DemoImageInput,
};

const SettingsFormField = ({
  formField,
  user,
  profile,
}: {
  formField: FormFieldProps;
  user?: User;
  profile?: MatchMeUser;
}) => {
  const {fieldDescription, fieldTitle, fieldType, fieldInputProps, fieldRequired} = formField;
  const fieldName = fieldInputProps[0].name;
  const InputComponent = fieldComponents[fieldType as keyof typeof fieldComponents] || SimpleInput;

  const {
    register,
    formState: {errors},
  } = useFormContext();

  const isTopSection = () => {
    return fieldType === "makeProfilePublic" || fieldType === "accountVerification";
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
      },
    },
  } as const;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex justify-between items-start gap-8  max-[990px]:gap-2",
        isTopSection() ? "" : "max-[990px]:flex-col",
      )}>
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">
          {fieldTitle} {fieldRequired && <span className="text-destructive">*</span>}
        </p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">{fieldDescription}</p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px]">
        <InputComponent
          id={fieldInputProps[0].id}
          placeholder={fieldInputProps[0].placeholder ?? ""}
          type={fieldType}
          disabled={fieldInputProps[0].disabled}
          name={fieldInputProps[0].name}
          readOnly={fieldInputProps[0].readOnly}
          options={fieldInputProps[0].options ?? []}
          socials={fieldInputProps[0].socials ?? []}
          register={fieldType === "image" ? undefined : register(fieldName)}
          error={errors[fieldName]}
          user={user!}
          mail={fieldInputProps[0].name === "email"}
          profile={profile}
          className={`${fieldInputProps[0].disabled && "bg-muted shadow-none text-foreground!"}`}
        />
      </div>
    </motion.div>
  );
};

export default SettingsFormField;
