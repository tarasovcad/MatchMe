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
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const ip = await getClientIp();

  const projectUserRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "6 h"), // 3 projects per 6 hours per user
    analytics: true,
    prefix: "ratelimit:user:project-creation",
    enableProtection: true,
  });

  const projectIpRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(15, "6 h"), // 15 projects per 6 hours per IP
    analytics: true,
    prefix: "ratelimit:ip:project-creation",
    enableProtection: true,
  });

  const [userLimit, ipLimit] = await Promise.all([
    projectUserRateLimiter.limit(user.id),
    projectIpRateLimiter.limit(ip),
  ]);

  if (!userLimit.success) {
    return {
      error: true,
      message: "Too many project creation attempts. Please try again later.",
    };
  }

  if (!ipLimit.success) {
    return {
      error: true,
      message: "Too many project creation attempts from this IP. Please try again later.",
    };
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
      // Skip keys that start with underscore
      if (key.startsWith("_")) {
        return acc;
      }
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

  const projectId = uuidv4();

  try {
    if (
      transformedData.project_image &&
      Array.isArray(transformedData.project_image) &&
      transformedData.project_image.length > 0
    ) {
      const projectImageData = transformedData.project_image[0] as {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      };

      if (projectImageData.url.startsWith("data:image/")) {
        // It's a new base64 image that needs to be uploaded
        const signedProjectImageUrl = await getUploadUrl(projectId, "project-avatars");

        const projectImage = await uploadImageBuffer(signedProjectImageUrl, projectImageData.url);

        if (projectImage.error) {
          return {error: projectImage.error, message: projectImage.message};
        }

        // Update the array with the new CloudFront URL
        transformedData.project_image = [
          {
            fileName: projectImageData.fileName,
            fileSize: projectImageData.fileSize,
            uploadedAt: projectImageData.uploadedAt,
            url: `${process.env.CLOUDFRONT_URL}/project-avatars/${projectId}/image.webp`,
          },
        ];

        // Invalidate the CloudFront cache
        await invalidateCloudFrontCache(`project-avatars/${projectId}/image.webp`);
      }
      // If it's an existing URL, keep the array as is
    } else {
      // No project image or empty array
      transformedData.project_image = null;
    }

    if (
      transformedData.background_image &&
      Array.isArray(transformedData.background_image) &&
      transformedData.background_image.length > 0
    ) {
      const backgroundImageData = transformedData.background_image[0] as {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      };

      if (backgroundImageData.url.startsWith("data:image/")) {
        // It's a new base64 image that needs to be uploaded
        const signedBackgroundImageUrl = await getUploadUrl(projectId, "project-backgrounds");

        const backgroundImage = await uploadImageBuffer(
          signedBackgroundImageUrl,
          backgroundImageData.url,
        );

        if (backgroundImage.error) {
          return {error: backgroundImage.error, message: backgroundImage.message};
        }

        // Update the array with the new CloudFront URL
        transformedData.background_image = [
          {
            fileName: backgroundImageData.fileName,
            fileSize: backgroundImageData.fileSize,
            uploadedAt: backgroundImageData.uploadedAt,
            url: `${process.env.CLOUDFRONT_URL}/project-backgrounds/${projectId}/image.webp`,
          },
        ];

        await invalidateCloudFrontCache(`project-backgrounds/${projectId}/image.webp`);
      }
      // If it's an existing URL, keep the array as is
    } else {
      // No background image or empty array
      transformedData.background_image = null;
    }

    if (
      transformedData.demo &&
      Array.isArray(transformedData.demo) &&
      transformedData.demo.length > 0
    ) {
      const processedDemoImages = [];

      for (let i = 0; i < transformedData.demo.length; i++) {
        const demoImageData = transformedData.demo[i] as {
          fileName: string;
          fileSize: number;
          uploadedAt: string;
          url: string;
        };

        if (demoImageData.url.startsWith("data:image/")) {
          // It's a new base64 image that needs to be uploaded
          const filename = `image_${i + 1}.webp`;
          const signedDemoImageUrl = await getUploadUrl(projectId, "project-demo-images", filename);

          const demoImage = await uploadImageBuffer(signedDemoImageUrl, demoImageData.url);

          if (demoImage.error) {
            return {error: demoImage.error, message: demoImage.message};
          }

          // Add processed image with new CloudFront URL
          processedDemoImages.push({
            fileName: demoImageData.fileName,
            fileSize: demoImageData.fileSize,
            uploadedAt: demoImageData.uploadedAt,
            url: `${process.env.CLOUDFRONT_URL}/project-demo-images/${projectId}/${filename}`,
          });

          // Invalidate the CloudFront cache for this specific demo image
          await invalidateCloudFrontCache(`project-demo-images/${projectId}/${filename}`);
        } else {
          // It's an existing URL, keep as is
          processedDemoImages.push(demoImageData);
        }
      }

      transformedData.demo = processedDemoImages;
    } else {
      // No demo images or empty array
      transformedData.demo = null;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  const {error} = await supabase
    .from("projects")
    .insert({
      id: projectId,
      ...transformedData,
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
