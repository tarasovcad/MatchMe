import AutogrowingTextarea from "@/components/ui/form/AutogrowingTextarea";
import NumberFieldInput from "@/components/ui/form/NumberFieldInput";
import PersonalWebsiteInput from "@/components/ui/form/PersonalWebsiteInput";
import SelectInputWithSearch from "@/components/ui/form/SelectInputWithSearch";
import SimpleInput from "@/components/ui/form/SimpleInput";
import SimpleSlider from "@/components/ui/form/SimpleSlider";
import TagsInput from "@/components/ui/form/TagsInput";
import MakeProfilePublicSwitch from "@/components/ui/settings/MakeProfilePublicSwitch";
import SettingsSelectField from "@/components/ui/settings/SettingsSelectField";
import SocialLinksInput from "@/components/ui/settings/SocialLinksInput";
import VerifyAccountButton from "@/components/ui/settings/VerifyAccountButton";
import {cn} from "@/lib/utils";
import {FormFieldProps} from "@/types/settingsFieldsTypes";
import React from "react";
import SettingsProfilePhoto from "../../settings/SettingsProfilePhoto";
import SelectInput from "@/components/ui/form/SelectInput";
import SettingsUsernameInput from "@/components/ui/settings/SettingsUsernameInput";
import {useFormContext} from "react-hook-form";

const fieldComponents = {
  text: SimpleInput,
  textarea: AutogrowingTextarea,
  selectWithSearch: SelectInputWithSearch,
  //   makeProfilePublic: MakeProfilePublicSwitch,
  //   accountVerification: VerifyAccountButton,
  number: NumberFieldInput,
  image: SettingsProfilePhoto,
  dropdown: SelectInput,
  //   select: SettingsSelectField,
  //   tags: TagsInput,
  //   slider: SimpleSlider,
  //   webiste: PersonalWebsiteInput,
  social: SocialLinksInput,
  //   username: SettingsUsernameInput,
};

const CreateProjectFormField = ({formField}: {formField: FormFieldProps}) => {
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

  return (
    <div
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
          placeholder={fieldInputProps[0].placeholder}
          type={fieldType}
          disabled={fieldInputProps[0].disabled}
          name={fieldInputProps[0].name}
          readOnly={fieldInputProps[0].readOnly}
          options={fieldInputProps[0].options ?? []}
          socials={fieldInputProps[0].socials ?? []}
          register={register(fieldName)}
          error={errors[fieldName]}
          mail={fieldInputProps[0].name === "email"}
          className={`${fieldInputProps[0].disabled && "bg-muted shadow-none text-foreground!"}`}
        />
      </div>
    </div>
  );
};

export default CreateProjectFormField;
