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
      // If the value is an empty string or 0 for work_availability, set it to null
      if (value === "") {
        acc[key] = null;
      } else if (key === "work_availability" && value === 0) {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
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
