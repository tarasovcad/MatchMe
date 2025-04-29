"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";
import {getUploadUrl} from "../aws/getUploadUrlUserAvatars";
import {uploadImageBuffer} from "../aws/uploadImageBuffer";
import {invalidateCloudFrontCache} from "@/functions/invalidateCloudFrontCache";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

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

  if (!userLimit.success) {
    return {
      error: true,
      message: "Too many security settings update attempts. Please try again later.",
    };
  }

  if (!ipLimit.success) {
    return {
      error: true,
      message: "Too many security settings update attempts from this IP. Please try again later.",
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
    if (transformedData.profile_image) {
      const signedProfileImageUrl = await getUploadUrl(user.id, "user-avatars");

      const profileImage = await uploadImageBuffer(
        signedProfileImageUrl,
        String(transformedData.profile_image),
      );

      if (profileImage.error) {
        return {error: profileImage.error, message: profileImage.message};
      }

      transformedData.profile_image = `${process.env.CLOUDFRONT_URL}/user-avatars/${user.id}/image.jpg`;

      // Invalidate the CloudFront cache
      await invalidateCloudFrontCache(`user-avatars/${user.id}/image.jpg`);
    }

    if (transformedData.background_image) {
      const signedBackgroundImageUrl = await getUploadUrl(user.id, "user-backgrounds");

      const backgroundImage = await uploadImageBuffer(
        signedBackgroundImageUrl,
        String(transformedData.background_image),
      );

      if (backgroundImage.error) {
        return {error: backgroundImage.error, message: backgroundImage.message};
      }

      transformedData.background_image = `${process.env.CLOUDFRONT_URL}/user-backgrounds/${user.id}/image.jpg`;

      await invalidateCloudFrontCache(`user-backgrounds/${user.id}/image.jpg`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
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
  // Update the user session with the new image
  if (transformedData.profile_image !== null) {
    const {error} = await supabase.auth.updateUser({
      data: {
        image: transformedData.profile_image,
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
  };
};
