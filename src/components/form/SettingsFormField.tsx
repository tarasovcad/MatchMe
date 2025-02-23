import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {FormFieldProps} from "@/types/settingsFieldsTypes";
import NumberFieldInput from "../ui/NumberFieldInput";
import SettingsProfilePhoto from "./SettingsProfilePhoto";
import SelectInput from "../ui/SelectInput";
import SettingsSelectField from "./SettingsSelectField";
import AutogrowingTextarea from "../ui/AutogrowingTextarea";
import Multiselect from "../ui/Multiselect";
import SimpleSlider from "../ui/settings/SimpleSlider";
import PersonalWebsiteInput from "../ui/settings/PersonalWebsiteInput";
import SocialLinksInput from "../ui/settings/SocialLinksInput";

const fieldComponents = {
  text: SimpleInput,
  number: NumberFieldInput,
  image: SettingsProfilePhoto,
  dropdown: SelectInput,
  select: SettingsSelectField,
  textarea: AutogrowingTextarea,
  tags: Multiselect,
  slider: SimpleSlider,
  webiste: PersonalWebsiteInput,
  social: SocialLinksInput,
};

const SettingsFormField = ({formField}: {formField: FormFieldProps}) => {
  const {fieldDescription, fieldTitle, fieldType, fieldInputProps} = formField;

  const InputComponent =
    fieldComponents[fieldType as keyof typeof fieldComponents] || SimpleInput;

  return (
    <div className="flex justify-between items-start gap-8 max-[990px]:flex-col max-[990px]:gap-2 ">
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="text-foreground text-sm font-medium">{fieldTitle}</p>
        {fieldDescription && (
          <p className="text-xs text-muted-foreground break-words">
            {fieldDescription}
          </p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px] ">
        <InputComponent
          id={fieldInputProps[0].id}
          placeholder={fieldInputProps[0].placeholder}
          type={fieldType}
          disabled={fieldInputProps[0].disabled}
          name={fieldInputProps[0].name}
          readOnly={fieldInputProps[0].readOnly}
          options={fieldInputProps[0].options ?? []}
          socials={fieldInputProps[0].socials ?? []}
          tags={fieldInputProps[0].tags ?? []}
          className={`${fieldInputProps[0].disabled && "bg-muted shadow-none !text-foreground"}`}
        />
      </div>
    </div>
  );
};

export default SettingsFormField;
