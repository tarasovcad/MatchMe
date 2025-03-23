"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsSecurityFormData} from "@/validation/settings/settingsSecurityValidation";

export const submitSecurityForm = async (
  formData: Partial<SettingsSecurityFormData>,
) => {
  try {
    const supabase = await createClient();

    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update the profile
    const {error} = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      return {error: error, message: "Error updating profile"};
    }

    const {error: sessionError} = await supabase.auth.updateUser({
      data: {
        username: formData.username,
      },
    });

    if (sessionError) {
      console.error("Error updating user session:", error);
      return {error: error, message: "Error updating user session"};
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  return {
    error: null,
    message: "Profile updated successfully",
  };
};
