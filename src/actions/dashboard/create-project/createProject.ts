"use server";
import {
  processSingleImageField,
  processMultipleImageField,
} from "@/actions/utils/processImageField";
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
    const projRes = await processSingleImageField(
      transformedData,
      "project_image",
      projectId,
      "project-avatars",
    );

    if (projRes.error) return projRes;

    const bgRes = await processSingleImageField(
      transformedData,
      "background_image",
      projectId,
      "project-backgrounds",
    );

    if (bgRes.error) return bgRes;

    const demoRes = await processMultipleImageField(
      transformedData,
      "demo",
      projectId,
      "project-demo-images",
    );

    if (demoRes.error) return demoRes;
  } catch (error) {
    console.error("Error updating profile:", error);
    return {error: error, message: "Error updating profile"};
  }

  const {data: projectData, error: projectError} = await supabase
    .from("projects")
    .insert({
      id: projectId,
      ...transformedData,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (projectError) {
    console.error("Detailed project creation error:", projectError);
    return {
      error: true,
      message: "Something went wrong creating your project. Please try again.",
    };
  }

  // Add the project creator as a team member with 'Founder' role and 'owner' permission
  const {error: teamMemberError} = await supabase.from("project_team_members").insert({
    project_id: projectId,
    user_id: user.id,
    role: "Founder",
    permission: "owner",
    is_active: true,
  });

  if (teamMemberError) {
    console.error("Error adding project creator to team members:", teamMemberError);

    // Rollback: Delete the created project since team member insertion failed
    await supabase.from("projects").delete().eq("id", projectId);

    return {
      error: true,
      message: "Something went wrong setting up your project team. Please try again.",
    };
  }

  return {
    error: false,
    message: "Project created successfully",
  };
};
