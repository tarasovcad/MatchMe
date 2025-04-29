"use server";
import {getUploadUrl} from "@/actions/aws/getUploadUrlUserAvatars";
import {uploadImageBuffer} from "@/actions/aws/uploadImageBuffer";
import {invalidateCloudFrontCache} from "@/functions/invalidateCloudFrontCache";
import {getClientIp} from "@/utils/network/getClientIp";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {ProjectCreationFormData} from "@/validation/project/projectCreationValidation";
import {Ratelimit} from "@upstash/ratelimit";

import {v4 as uuidv4} from "uuid";

const MAX_PROJECTS = 3;

export const createProject = async (formData: Partial<ProjectCreationFormData>) => {
  const ip = await getClientIp();

  const projectRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:ip:project-creation",
    enableProtection: true,
  });

  const projectLimit = await projectRateLimiter.limit(ip);

  if (!projectLimit.success) {
    return {
      error: true,
      message: `Rate limit exceeded. Try again in later`,
    };
  }

  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }
  const {count, error: countError} = await supabase
    .from("projects")
    .select("*", {count: "exact", head: true})
    .eq("user_id", user.id);

  if (countError) {
    return {
      error: true,
      message: "Error checking project count",
    };
  }

  if (count && count >= MAX_PROJECTS) {
    return {
      error: true,
      message: `You cannot create more than ${MAX_PROJECTS} projects`,
    };
  }

  const transformedData = Object.entries(formData).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        // If value is an empty array, set it to null
        acc[key] = null;
      } else if (value === "") {
        // If value is an empty string, set it to null
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, Partial<ProjectCreationFormData>[keyof ProjectCreationFormData] | null>,
  );

  const cleanedData = Object.entries(transformedData).reduce(
    (acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, Partial<ProjectCreationFormData>[keyof ProjectCreationFormData]>,
  );

  const projectId = uuidv4();

  try {
    if (cleanedData.project_image) {
      const signedProfileImageUrl = await getUploadUrl(projectId, "project-avatars");

      const profileImage = await uploadImageBuffer(
        signedProfileImageUrl,
        String(cleanedData.project_image),
      );

      if (profileImage.error) {
        return {error: profileImage.error, message: profileImage.message};
      }

      cleanedData.project_image = `${process.env.CLOUDFRONT_URL}/project-avatars/${projectId}/image.jpg`;

      // Invalidate the CloudFront cache
      await invalidateCloudFrontCache(`project-avatars/${projectId}/image.jpg`);
    }

    if (cleanedData.background_image) {
      const signedBackgroundImageUrl = await getUploadUrl(projectId, "project-backgrounds");

      const backgroundImage = await uploadImageBuffer(
        signedBackgroundImageUrl,
        String(cleanedData.background_image),
      );

      if (backgroundImage.error) {
        return {error: backgroundImage.error, message: backgroundImage.message};
      }

      cleanedData.background_image = `${process.env.CLOUDFRONT_URL}/project-backgrounds/${projectId}/image.jpg`;

      await invalidateCloudFrontCache(`project-backgrounds/${projectId}/image.jpg`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  const {error} = await supabase
    .from("projects")
    .insert({
      id: projectId,
      ...cleanedData,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Detailed error:", error);
    return {
      error: true,
      message: "Something went wrong creating your project. Please try again.",
    };
  }

  return {
    error: false,
    message: "Project created successfully",
  };
};
