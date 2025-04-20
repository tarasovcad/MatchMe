"use server";
import {getClientIp} from "@/utils/network/getClientIp";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {ProjectCreationFormData} from "@/validation/project/projectCreationValidation";
import {Ratelimit} from "@upstash/ratelimit";

const MAX_PROJECTS = 3;

export const createProject = async (formData: Partial<ProjectCreationFormData>) => {
  const ip = await getClientIp();

  const projectRateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit:ip:project-creation",
    enableProtection: true,
  });

  const projectLimit = await projectRateLimiter.limit(ip);

  if (!projectLimit.success) {
    return {
      error: true,
      message: `Rate limit exceeded. Try again in ${Math.ceil(
        projectLimit.reset - Date.now() / 1000,
      )} seconds`,
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

  const {error} = await supabase.from("projects").insert({
    ...cleanedData,
    user_id: user.id,
  });

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
