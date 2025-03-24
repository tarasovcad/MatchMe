import SettingsFormField from "@/components/form/SettingsFormField";
import {
  accountSettingsFormFields,
  accountSettingsFormFieldsTop,
} from "@/data/forms/(settings)/accountSettingsFormFields";
import {cn} from "@/lib/utils";
import React, {useEffect, useState} from "react";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SettingsAccountFormData,
  settingsAccountValidationSchema,
} from "@/validation/settings/settingsAccountValidation";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {submitAccountForm} from "@/actions/settings/submitAccountForm";
import {isEqual, pickBy} from "lodash";
import {toast} from "sonner";
import {motion} from "framer-motion";
import {containerVariants, itemVariants} from "@/utils/other/variants";

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
  const determineDefaultPlatform = (
    existingPlatforms: string | null,
    defaultValue: string,
  ) => {
    // If the platform is already specified, use it
    if (existingPlatforms) return existingPlatforms;

    // If the default platform is already used in other fields, return empty string
    const usedPlatforms = [
      profile.social_links_1_platform,
      profile.social_links_2_platform,
      profile.social_links_3_platform,
    ].filter(Boolean);

    return usedPlatforms.includes(defaultValue) ? "" : defaultValue;
  };

  const [initialValues, setInitialValues] = useState<SettingsAccountFormData>({
    is_profile_public: profile.is_profile_public ?? false,
    is_profile_verified: profile.is_profile_verified ?? false,
    name: profile.name ?? "",
    username: profile.username ?? "",
    image: profile.image ?? "",
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
    social_links_1_platform: determineDefaultPlatform(
      profile.social_links_1_platform,
      "x.com/",
    ),
    social_links_1: profile.social_links_1 ?? "",
    social_links_2_platform: determineDefaultPlatform(
      profile.social_links_2_platform,
      "github.com/",
    ),
    social_links_2: profile.social_links_2 ?? "",
    social_links_3_platform: determineDefaultPlatform(
      profile.social_links_3_platform,
      "linkedin.com/",
    ),
    social_links_3: profile.social_links_3 ?? "",
  });

  const methods = useForm<SettingsAccountFormData>({
    resolver: zodResolver(settingsAccountValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });
  // Watch for changes in form values in real-time
  const formValues = useWatch({control: methods.control});

  // Get the form state to check for errors
  const {formState} = methods;

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

    setIsDisabled(!hasChanged || !formState.isValid);
  }, [formValues, initialValues, formState.isValid, setIsDisabled]);

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      // Create an object containing only the values that differ from initialValues
      const changedValues = Object.keys(data).reduce((result, key) => {
        const formKey = key as keyof SettingsAccountFormData;

        const currentValue = data[formKey] === undefined ? "" : data[formKey];
        const initialValue =
          initialValues[formKey] === undefined ? "" : initialValues[formKey];

        // Compare each field with its initial value
        if (!isEqual(currentValue, initialValue)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result[formKey] = currentValue as any;
        }

        return result;
      }, {} as Partial<SettingsAccountFormData>);

      // Only make an API call if there are actual changes to submit
      if (Object.keys(changedValues).length > 0) {
        const response = await submitAccountForm(changedValues);
        console.log("Response:", response);

        if (response.error) {
          console.error("Error submitting account form:", response.error);
          toast.error(response.message);
          setIsLoading(false);
          return;
        }

        setInitialValues({...initialValues, ...data});
        setIsLoading(false);
        toast.success(response.message);
      } else {
        console.log("No changes to submit");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error submitting account form");
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6">
        <motion.div
          variants={itemVariants}
          className="border border-border rounded-[8px]">
          {accountSettingsFormFieldsTop.map((formField, index) => (
            <motion.div
              key={formField.fieldTitle}
              variants={itemVariants}
              className={cn(
                "px-[18px] py-3",
                index !== 0 && "border-t border-border",
              )}>
              <SettingsFormField formField={formField} profile={profile} />
            </motion.div>
          ))}
        </motion.div>
        {accountSettingsFormFields.map((formFields, index) => (
          <motion.div
            key={formFields.formTitle}
            variants={itemVariants}
            className={`flex flex-col gap-9 max-[990px]:gap-8 ${
              index !== 0 && "border-t border-border pt-6"
            }`}>
            <h4 className="font-semibold text-foreground text-xl">
              {formFields.formTitle}
            </h4>
            <motion.div
              variants={containerVariants}
              className="flex flex-col gap-6">
              {formFields.formData.map((formField) => (
                <motion.div key={formField.fieldTitle} variants={itemVariants}>
                  <SettingsFormField formField={formField} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </FormProvider>
  );
};

export default AccountTab;
