import SettingsFormField from "@/components/ui/settings/SettingsFormField";
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
import {isEqual} from "lodash";
import {toast} from "sonner";
import {motion} from "framer-motion";
import {containerVariants, itemVariants} from "@/utils/other/variants";

const AccountTab = ({
  profile,
  setIsLoading,
  setHandleSave,
  setHandleCancel,
  setIsDisabled,
  setClearDisabled,
}: {
  profile: MatchMeUser;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHandleSave: React.Dispatch<React.SetStateAction<() => void>>;
  setHandleCancel: React.Dispatch<React.SetStateAction<() => void>>;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setClearDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // Helper function to normalize values for comparison
  const normalizeValue = (value: unknown, fieldName: string) => {
    // For number fields, treat empty string and undefined as equivalent
    const numberFields = ["age", "years_of_experience", "work_availability"];
    if (numberFields.includes(fieldName)) {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }
    }
    return value;
  };

  const determineDefaultPlatform = (existingPlatforms: string | null, defaultValue: string) => {
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
    profile_image: profile.profile_image ?? [],
    background_image: profile.background_image ?? [],
    pronouns: profile.pronouns ?? "",
    age: profile.age ?? undefined,
    public_current_role: profile.public_current_role ?? "",
    seniority_level: profile.seniority_level ?? "",
    years_of_experience: profile.years_of_experience ?? undefined,
    looking_for: profile.looking_for ?? "",
    goal: profile.goal ?? "",
    tagline: profile.tagline ?? "",
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    work_availability: profile.work_availability ?? undefined,
    location: profile.location ?? "",
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    personal_website: profile.personal_website ?? "",
    about_you: profile.about_you ?? "",
    social_links_1_platform: determineDefaultPlatform(profile.social_links_1_platform, "x.com/"),
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
    // Compare each field individually to detect changes
    const hasFieldChanged = Object.keys(formValues).some((key) => {
      const formKey = key as keyof SettingsAccountFormData;
      const currentValue = normalizeValue(formValues[formKey], key);
      const initialValue = normalizeValue(initialValues[formKey], key);

      // Check if the values are different
      return !isEqual(currentValue, initialValue);
    });

    // Special check for image arrays - if they go from empty to having content, that's a change
    const imageArraysChanged =
      ((!initialValues.profile_image || initialValues.profile_image.length === 0) &&
        formValues.profile_image &&
        formValues.profile_image.length > 0) ||
      ((!initialValues.background_image || initialValues.background_image.length === 0) &&
        formValues.background_image &&
        formValues.background_image.length > 0);

    const hasChanges = hasFieldChanged || imageArraysChanged;

    // Disable save when there are no changes or validation errors
    setIsDisabled(!hasChanges || !formState.isValid);

    // Disable clear button only when there are no changes
    if (setClearDisabled) {
      setClearDisabled(!hasChanges);
    }
  }, [formValues, initialValues, formState.isValid, setIsDisabled, setClearDisabled]);

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      const socialLinkFields = [
        "social_links_1_platform",
        "social_links_2_platform",
        "social_links_3_platform",
      ];

      // Create an object containing only the values that differ from initialValues
      const changedValues = Object.keys(data).reduce((result, key) => {
        const formKey = key as keyof SettingsAccountFormData;

        const currentValue = normalizeValue(data[formKey], key);
        const initialValue = normalizeValue(initialValues[formKey], key);

        // Compare each field with its initial value
        if (
          !isEqual(currentValue, initialValue) ||
          // Include platform values if the corresponding link has a value
          (socialLinkFields.includes(key) &&
            data[key.replace("_platform", "") as keyof SettingsAccountFormData])
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result[formKey] = currentValue as any;
        }

        return result;
      }, {} as Partial<SettingsAccountFormData>);

      // ALWAYS include image fields if they currently have values to prevent nullification
      if (data.profile_image && data.profile_image.length > 0) {
        changedValues.profile_image = data.profile_image;
      }

      if (data.background_image && data.background_image.length > 0) {
        changedValues.background_image = data.background_image;
      }

      // Only make an API call if there are actual changes to submit
      if (Object.keys(changedValues).length > 0) {
        const response = await submitAccountForm(changedValues);
        if (response.error) {
          console.error("Error submitting account form:", response.error);
          toast.error(response.message);
          setIsLoading(false);
          return;
        } else {
          // Check if profile was automatically set to private
          let finalData = data;
          if (response.profileSetToPrivate) {
            finalData = {...data, is_profile_public: false};
            toast.warning("Your profile was set to private because required fields are missing.");
          }

          const newInitialValues = {...initialValues, ...finalData};
          setInitialValues(newInitialValues);
          methods.reset(newInitialValues);
          setIsLoading(false);
          toast.success(response.message);
        }
      }
      setIsLoading(false);
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
        <motion.div variants={itemVariants} className="border border-border rounded-[8px]">
          {accountSettingsFormFieldsTop.map((formField, index) => (
            <motion.div
              key={formField.fieldTitle}
              variants={itemVariants}
              className={cn("px-[18px] py-3", index !== 0 && "border-t border-border")}>
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
            <h4 className="font-semibold text-foreground text-xl">{formFields.formTitle}</h4>
            <motion.div variants={containerVariants} className="flex flex-col gap-6">
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
