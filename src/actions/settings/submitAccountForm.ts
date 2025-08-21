"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";
import {processSingleImageField} from "../utils/processImageField";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {canMakePublic} from "@/functions/canMakePublic";
import {invalidateUserCaches} from "../profiles/singleUserProfile";

export const submitAccountForm = async (formData: Partial<SettingsAccountFormData>) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const ip = await getClientIp();

  const settingsAccountLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "5 m"), // 10 attempts per 5 minutes
    analytics: true,
    prefix: "ratelimit:settings",
    enableProtection: true,
  });

  const settingsAccountIpLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "10 m"), // 15 attempts per 10 minutes per IP
    analytics: true,
    prefix: "ratelimit:ip:settings",
    enableProtection: true,
  });

  const [userLimit, ipLimit] = await Promise.all([
    settingsAccountLimit.limit(user.id),
    settingsAccountIpLimit.limit(ip),
  ]);

  if (!userLimit.success || !ipLimit.success) {
    return {
      error: true,
      message: "Too many security settings update attempts. Please try again later.",
    };
  }

  // Transform empty strings to null
  const transformedData = Object.entries(formData).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        // If value is an empty array, set it to null
        acc[key] = null;
      } else if (value === "") {
        // If value is an empty string, set it to null
        acc[key] = null;
      } else if (key === "work_availability" && value === 0) {
        // Special case for work_availability (for number)
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, Partial<SettingsAccountFormData>[keyof SettingsAccountFormData] | null>,
  );

  try {
    const profileRes = await processSingleImageField(
      transformedData,
      "profile_image",
      user.id,
      "user-avatars",
    );

    if (profileRes.error) {
      return {error: true, message: profileRes.message};
    }

    // Reuse helper for background image
    const bgRes = await processSingleImageField(
      transformedData,
      "background_image",
      user.id,
      "user-backgrounds",
    );

    if (bgRes.error) {
      return {error: true, message: bgRes.message};
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  // Backend validation: ensure profile can't be made public if incomplete
  // Get current profile data to merge with updates for validation
  const {data: currentProfile} = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let wasAutomaticallySetToPrivate = false;

  if (currentProfile) {
    // Merge current profile with the updates to get the complete picture
    const updatedProfileState = {
      ...currentProfile,
      ...transformedData,
    } as MatchMeUser;

    const {canMakePublic: canMakeProfilePublic} = canMakePublic(updatedProfileState);

    // Check if user is trying to set profile public when it's incomplete
    if (transformedData.is_profile_public === true && !canMakeProfilePublic) {
      transformedData.is_profile_public = false;
      wasAutomaticallySetToPrivate = true;
    }
    // Check if profile is currently public but will become incomplete after updates
    else if (
      currentProfile.is_profile_public === true &&
      !canMakeProfilePublic &&
      transformedData.is_profile_public !== false // User didn't explicitly set it to false
    ) {
      transformedData.is_profile_public = false;
      wasAutomaticallySetToPrivate = true;
      console.warn(
        `User ${user.id} profile was public but became incomplete after updates - forced to false`,
      );
    }
  }

  // Update the profile
  const {error} = await supabase
    .from("profiles")
    .update(transformedData)
    .eq("id", user.id)
    .select();

  if (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  // Invalidate user caches after successful update
  if (currentProfile?.username) {
    try {
      await invalidateUserCaches(user.id, currentProfile.username);
    } catch (cacheError) {
      console.error("Error invalidating user caches:", cacheError);
      // Don't fail the request if cache invalidation fails
    }
  }
  // Update the user session with the new image
  if (
    transformedData.profile_image !== null &&
    Array.isArray(transformedData.profile_image) &&
    transformedData.profile_image.length > 0
  ) {
    const profileImageData = transformedData.profile_image[0] as {
      fileName: string;
      fileSize: number;
      uploadedAt: string;
      url: string;
    };
    const {error} = await supabase.auth.updateUser({
      data: {
        image: profileImageData.url,
      },
    });
    if (error) {
      console.error("Error updating user session:", error);
      return {error: error, message: "Error updating user session"};
    }
  } else {
    const {error} = await supabase.auth.updateUser({
      data: {
        profile_image: "",
      },
    });
    if (error) {
      console.error("Error updating user session:", error);
      return {error: error, message: "Error updating user session"};
    }
  }

  return {
    error: null,
    message: "Profile updated successfully",
    profileSetToPrivate: wasAutomaticallySetToPrivate,
  };
};
