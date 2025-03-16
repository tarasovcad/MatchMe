"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";

export const submitAccountForm = async (
  formData: Partial<SettingsAccountFormData>,
) => {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Transform empty strings to null
  const transformedData = Object.entries(formData).reduce(
    (acc, [key, value]) => {
      // If the value is an empty string, set it to null
      acc[key] = value === "" ? null : value;
      return acc;
    },
    {} as Record<
      string,
      Partial<SettingsAccountFormData>[keyof SettingsAccountFormData] | null
    >,
  );

  console.log("Updating profile with data:", transformedData);

  // Update the profile that matches the current user's ID
  const {error} = await supabase
    .from("profiles")
    .update(transformedData)
    .eq("id", user.id)
    .select();

  if (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  return {
    error: null,
    message: "Profile updated successfully",
  };
};
