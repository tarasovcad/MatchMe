"use client";
import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {FormFieldProps} from "@/types/settingsFieldsTypes";
import NumberFieldInput from "../ui/NumberFieldInput";
import SettingsProfilePhoto from "../(pages)/settings/SettingsProfilePhoto";
import SelectInput from "../ui/SelectInput";
import SettingsSelectField from "./SettingsSelectField";
import AutogrowingTextarea from "../ui/AutogrowingTextarea";
import SimpleSlider from "../ui/settings/SimpleSlider";
import PersonalWebsiteInput from "../ui/settings/PersonalWebsiteInput";
import SocialLinksInput from "../ui/settings/SocialLinksInput";
import {useFormContext} from "react-hook-form";
import MakeProfilePublicSwitch from "../ui/settings/MakeProfilePublicSwitch";
import VerifyAccountButton from "../ui/settings/VerifyAccountButton";
import {cn} from "@/lib/utils";
import TagsInput from "../ui/settings/TagsInput";
import TimeZoneInput from "../(pages)/settings/TimeZoneInput";
import {motion} from "framer-motion";

const fieldComponents = {
  makeProfilePublic: MakeProfilePublicSwitch,
  accountVerification: VerifyAccountButton,
  text: SimpleInput,
  number: NumberFieldInput,
  image: SettingsProfilePhoto,
  dropdown: SelectInput,
  select: SettingsSelectField,
  textarea: AutogrowingTextarea,
  tags: TagsInput,
  slider: SimpleSlider,
  webiste: PersonalWebsiteInput,
  social: SocialLinksInput,
  timezone: TimeZoneInput,
};

const SettingsFormField = ({formField}: {formField: FormFieldProps}) => {
  const {
    fieldDescription,
    fieldTitle,
    fieldType,
    fieldInputProps,
    fieldRequired,
  } = formField;
  const fieldName = fieldInputProps[0].name;
  const InputComponent =
    fieldComponents[fieldType as keyof typeof fieldComponents] || SimpleInput;

  const {
    register,
    formState: {errors},
  } = useFormContext();

  const isTopSection = () => {
    return (
      fieldType === "makeProfilePublic" || fieldType === "accountVerification"
    );
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
  };

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex justify-between items-start gap-8  max-[990px]:gap-2",
        isTopSection() ? "" : "max-[990px]:flex-col",
      )}>
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">
          {fieldTitle}{" "}
          {fieldRequired && <span className="text-destructive">*</span>}
        </p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">
            {fieldDescription}
          </p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px]">
        <InputComponent
          id={fieldInputProps[0].id}
          placeholder={fieldInputProps[0].placeholder}
          type={fieldType}
          disabled={fieldInputProps[0].disabled}
          name={fieldInputProps[0].name}
          readOnly={fieldInputProps[0].readOnly}
          options={fieldInputProps[0].options ?? []}
          socials={fieldInputProps[0].socials ?? []}
          register={register(fieldName)}
          error={errors[fieldName]}
          className={`${fieldInputProps[0].disabled && "bg-muted shadow-none text-foreground!"}`}
        />
      </div>
    </motion.div>
  );
};

export default SettingsFormField;
