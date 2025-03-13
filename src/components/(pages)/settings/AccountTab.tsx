import SettingsFormField from "@/components/form/SettingsFormField";
import {
  accountSettingsFormFields,
  accountSettingsFormFieldsTop,
} from "@/data/forms/(settings)/accountSettingsFormFields";
import {cn} from "@/lib/utils";
import React, {useEffect, useState} from "react";
import {FormProvider, useForm, useFormContext, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SettingsAccountFormData,
  settingsAccountValidationSchema,
} from "@/validation/settings/settingsAccountValidation";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {submitAccountForm} from "@/actions/settings/submitAccountForm";
import {isEqual, pickBy} from "lodash";

const AccountTab = ({
  profile,
  setIsLoading,
  setHandleSave,
  setHandleCancel,
  setIsDisabled,
}: {
  profile: MatchMeUser;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHandleSave: React.Dispatch<React.SetStateAction<() => void>>;
  setHandleCancel: React.Dispatch<React.SetStateAction<() => void>>;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const initialValues = {
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
    about_you: "",
    social_links_1_platform: "x.com/",
    social_links_1: "",
    social_links_2_platform: "github.com/",
    social_links_2: "",
    social_links_3_platform: "linkedin.com/",
    social_links_3: "",
  };

  const methods = useForm<SettingsAccountFormData>({
    resolver: zodResolver(settingsAccountValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  // Watch for changes in form values in real-time
  const formValues = useWatch({control: methods.control});

  // This useEffect tracks changes between current form values and initial values
  // Purpose: Enable/disable the save button based on whether form has changed
  useEffect(() => {
    // Filter initialValues to only include properties that are defined, so no empty values are included
    const cleanInitialValues = pickBy(
      initialValues,
      (value) => value !== undefined,
    );

    // Filter formValues to only include keys that exist in initialValues
    // This ensures we only compare fields that were originally provided
    const cleanFormValues = pickBy(
      formValues,
      (_, key) => key in cleanInitialValues,
    );

    // Compare cleaned values to determine if form has changed
    const hasChanged = !isEqual(cleanFormValues, cleanInitialValues);

    setIsDisabled(!hasChanged);
  }, [formValues, initialValues, setIsDisabled]);

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      // Create an object containing only the values that differ from initialValues
      const changedValues = Object.keys(data).reduce((result, key) => {
        const formKey = key as keyof SettingsAccountFormData;

        // Compare each field with its initial value
        if (!isEqual(data[formKey], initialValues[formKey])) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result[formKey] = data[formKey] as any;
        }
        return result;
      }, {} as Partial<SettingsAccountFormData>);

      // Only make an API call if there are actual changes to submit
      if (Object.keys(changedValues).length > 0) {
        console.log("Submitting only changed values:", changedValues);
        await submitAccountForm(changedValues);
      } else {
        console.log("No changes to submit");
      }
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
