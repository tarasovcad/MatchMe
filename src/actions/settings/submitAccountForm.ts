"use server";

import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";

export const submitAccountForm = async (formData: SettingsAccountFormData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("submit happened");
      console.log(formData);
      resolve({});
    }, 2000);
  });
};
