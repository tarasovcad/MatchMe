import SettingsFormField from "@/components/form/SettingsFormField";
import {
  accountSettingsFormFields,
  accountSettingsFormFieldsTop,
} from "@/data/forms/(settings)/accountSettingsFormFields";
import {cn} from "@/lib/utils";
import React, {useEffect} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SettingsAccountFormData,
  settingsAccountValidationSchema,
} from "@/validation/settings/settingsAccountValidation";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {submitAccountForm} from "@/actions/settings/submitAccountForm";

const AccountTab = ({
  profile,
  setIsLoading,
  setHandleSave,
  setHandleCancel,
}: {
  profile: MatchMeUser;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHandleSave: React.Dispatch<React.SetStateAction<() => void>>;
  setHandleCancel: React.Dispatch<React.SetStateAction<() => void>>;
}) => {
  const methods = useForm<SettingsAccountFormData>({
    resolver: zodResolver(settingsAccountValidationSchema),
    mode: "onChange",
    defaultValues: {
      is_profile_public: profile.is_profile_public ?? false,
      is_profile_verified: profile.is_profile_verified ?? false,
      name: profile.name ?? "",
      username: profile.username ?? "",
      pronouns: profile.pronouns ?? "",
      age: profile.age ?? undefined,
      public_current_role: profile.public_current_role ?? "",
      looking_for: profile.looking_for ?? "",
      goal: profile.goal ?? "",
      tagline: profile.tagline ?? "",
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      work_availability: profile.work_availability ?? undefined,
      location_timezone: profile.location_timezone ?? "",
      languages: Array.isArray(profile.languages) ? profile.languages : [],
      personal_website: profile.personal_website ?? "",
      about_you: profile.about_you ?? "",
    },
  });

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      await submitAccountForm(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    methods.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    methods.reset();
  };

  useEffect(() => {
    setHandleSave(() => handleSave);
    setHandleCancel(() => handleCancel);
  }, [setHandleSave, setHandleCancel]);

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6">
        <div className="border border-border rounded-[8px]">
          {accountSettingsFormFieldsTop.map((formField, index) => {
            return (
              <div
                key={formField.fieldTitle}
                className={cn(
                  "px-[18px] py-3",
                  index !== 0 && "border-t border-border",
                )}>
                <SettingsFormField formField={formField} />
              </div>
            );
          })}
        </div>
        {accountSettingsFormFields.map((formFields, index) => {
          return (
            <div
              key={formFields.formTitle}
              className={`flex flex-col gap-9 max-[990px]:gap-8 ${index !== 0 && "border-t border-border pt-6"}`}>
              <h4 className="font-semibold text-foreground text-xl">
                {formFields.formTitle}
              </h4>
              <div className="flex flex-col gap-6">
                {formFields.formData.map((formField) => {
                  return (
                    <SettingsFormField
                      formField={formField}
                      key={formField.fieldTitle}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </FormProvider>
  );
};

export default AccountTab;
