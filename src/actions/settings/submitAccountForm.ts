"use server";

import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";

export const submitAccountForm = async (formData: SettingsAccountFormData) => {
  console.log("submit happened");
  console.log(formData);
};
