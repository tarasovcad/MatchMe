import SettingsFormField from "@/components/form/SettingsFormField";
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
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";

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

  return (
    <FormProvider {...methods}>
      {securitySettingsFormFields.map((formFields, index) => (
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
                <SettingsFormField formField={formField} user={user} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </FormProvider>
  );
};

export default SecurityTab;
