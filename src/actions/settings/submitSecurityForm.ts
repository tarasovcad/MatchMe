"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsSecurityFormData} from "@/validation/settings/settingsSecurityValidation";
import {invalidateUserCaches} from "../profiles/singleUserProfile";

export const submitSecurityForm = async (formData: Partial<SettingsSecurityFormData>) => {
  try {
    const supabase = await createClient();

    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const {data: profile, error: fetchError} = await supabase
      .from("profiles")
      .select("username_changed_at, username")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return {error: fetchError, message: "Error fetching profile data"};
    }

    if (profile?.username_changed_at) {
      const lastChangedDate = new Date(profile.username_changed_at);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastChangedDate > oneMonthAgo) {
        return {
          error: true,
          message: "You can only change your username once a month.",
        };
      }
    }

    const formDataWithTimestamp = {
      ...formData,
      username_changed_at: new Date().toISOString(),
    };

    // Update the profile
    const {error} = await supabase
      .from("profiles")
      .update(formDataWithTimestamp)
      .eq("id", user.id)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      return {error: error, message: "Error updating profile"};
    }

    const {error: sessionError} = await supabase.auth.updateUser({
      data: {
        username: formDataWithTimestamp.username,
      },
    });

    if (sessionError) {
      console.error("Error updating user session:", error);
      return {error: error, message: "Error updating user session"};
    }

    // Invalidate user caches after successful update
    const oldUsername = profile?.username;
    const newUsername = formDataWithTimestamp.username;

    try {
      // If username changed, invalidate both old and new username caches
      if (oldUsername && newUsername && oldUsername !== newUsername) {
        await Promise.all([
          invalidateUserCaches(user.id, oldUsername),
          invalidateUserCaches(user.id, newUsername),
        ]);
      } else if (oldUsername) {
        // If no username change but still need to invalidate (other data might have changed)
        await invalidateUserCaches(user.id, oldUsername);
      }
    } catch (cacheError) {
      console.error("Error invalidating user caches:", cacheError);
      // Don't fail the request if cache invalidation fails
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
