import {submitSecurityForm} from "@/actions/settings/submitSecurityForm";
import SettingsFormField from "@/components/ui/settings/SettingsFormField";
import {securitySettingsFormFields} from "@/data/forms/(settings)/securitySettingsFormFields";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {containerVariants, itemVariants} from "@/utils/other/variants";
import {
  SettingsSecurityFormData,
  settingsSecurityValidationSchema,
} from "@/validation/settings/settingsSecurityValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {User} from "@supabase/supabase-js";
import {motion} from "framer-motion";
import {isEqual, pickBy} from "lodash";
import React, {useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {toast} from "sonner";

const SecurityTab = ({
  profile,
  setIsLoading,
  setHandleSave,
  setHandleCancel,
  setIsDisabled,
  user,
}: {
  profile: MatchMeUser;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHandleSave: React.Dispatch<React.SetStateAction<() => void>>;
  setHandleCancel: React.Dispatch<React.SetStateAction<() => void>>;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
}) => {
  const [initialValues, setInitialValues] = useState<SettingsSecurityFormData>({
    email: profile.email ?? "",
    username: profile.username ?? "",
    newUsername: "",
  });

  const methods = useForm<SettingsSecurityFormData>({
    resolver: zodResolver(settingsSecurityValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const {formState} = methods;
  const formValues = methods.watch();

  useEffect(() => {
    setHandleSave(() => handleSave);
    setHandleCancel(() => handleCancel);
  }, [setHandleSave, setHandleCancel]);

  const handleSave = () => {
    methods.handleSubmit(onSubmit)();
  };
  const handleCancel = () => {
    methods.reset();
  };

  useEffect(() => {
    // Filter out 'newUsername' from initialValues and formValues
    const cleanInitialValues = pickBy(
      initialValues,
      (value, key) => key !== "newUsername" && value !== undefined,
    );

    const cleanFormValues = pickBy(
      formValues,
      (_, key) => key in cleanInitialValues && key !== "newUsername",
    );
    // Compare cleaned values to determine if form has changed
    const hasChanged = !isEqual(cleanFormValues, cleanInitialValues);

    setIsDisabled(!hasChanged || !formState.isValid);
  }, [formValues, initialValues, formState.isValid, setIsDisabled]);

  const onSubmit = async (data: SettingsSecurityFormData) => {
    setIsLoading(true);
    try {
      // Remove 'newUsername' from comparison
      const filteredData = pickBy(data, (_, key) => key !== "newUsername");
      const filteredInitialValues = pickBy(initialValues, (_, key) => key !== "newUsername");

      // Create an object containing only the changed values
      const changedValues = Object.keys(filteredData).reduce((result, key) => {
        const formKey = key as keyof SettingsSecurityFormData;
        const currentValue = filteredData[formKey] ?? "";
        const initialValue = filteredInitialValues[formKey] ?? "";

        if (!isEqual(currentValue, initialValue)) {
          result[formKey] = currentValue;
        }

        return result;
      }, {} as Partial<SettingsSecurityFormData>);

      // Only submit if there are actual changes
      if (Object.keys(changedValues).length > 0) {
        console.log("Submitting changes:", changedValues);
        const response = await submitSecurityForm(changedValues);

        if (response.error) {
          console.error("Error submitting security form:", response.error);
          toast.error(response.message);
          setIsLoading(false);
          return;
        }

        // Update initial values and show success notification
        setInitialValues((prev) => ({...prev, ...filteredData}));
        toast.success(response.message);
      } else {
        console.log("No changes to submit");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error submitting security form");
    }
    setIsLoading(false);
  };

  return (
    <FormProvider {...methods}>
      {securitySettingsFormFields.map((formFields, index) => (
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
                <SettingsFormField formField={formField} user={user} profile={profile} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </FormProvider>
  );
};

export default SecurityTab;
