"use server";

import {createClient} from "@/utils/supabase/server";
import {SettingsAccountFormData} from "@/validation/settings/settingsAccountValidation";
import {getUploadUrl} from "../aws/getUploadUrlUserAvatars";
import {uploadUserAvatar} from "../aws/uploadUserAvatar";
import {invalidateCloudFrontCache} from "@/functions/invalidateCloudFrontCache";

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
    {} as Record<
      string,
      Partial<SettingsAccountFormData>[keyof SettingsAccountFormData] | null
    >,
  );
  try {
    if (transformedData.image) {
      const signedUrl = await getUploadUrl(user.id);
      const result = await uploadUserAvatar(
        signedUrl,
        String(transformedData.image),
      );

      if (result.error) {
        return {error: result.error, message: result.message};
      } else {
        console.log(result.message);
        transformedData.image = `${process.env.CLOUDFRONT_URL}/user-avatars/${user.id}/image.jpg`;

        // Invalidate the CloudFront cache
        await invalidateCloudFrontCache(`user-avatars/${user.id}/image.jpg`);
      }
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
  if (transformedData.image !== null) {
    const {error} = await supabase.auth.updateUser({
      data: {
        image: transformedData.image,
      },
    });
    if (error) {
      console.error("Error updating user session:", error);
      return {error: error, message: "Error updating user session"};
    }
  } else {
    const {error} = await supabase.auth.updateUser({
      data: {
        image: "",
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
