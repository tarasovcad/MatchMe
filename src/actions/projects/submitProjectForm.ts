"use server";

import {createClient} from "@/utils/supabase/server";
import {processSingleImageField} from "../utils/processImageField";

export const submitProjectForm = async (projectId: string, formData: Record<string, unknown>) => {
  const supabase = await createClient();

  // Transform empty strings / empty arrays to null for consistency
  const transformedData = Object.entries(formData).reduce(
    (acc, [key, value]) => {
      if (value === "" || (Array.isArray(value) && value.length === 0)) {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  try {
    // Handle project main image
    const projectImgRes = await processSingleImageField(
      transformedData,
      "project_image",
      projectId,
      "project-avatars",
    );

    if (projectImgRes.error) {
      return {error: true, message: projectImgRes.message};
    }

    // Handle background image
    const bgImgRes = await processSingleImageField(
      transformedData,
      "background_image",
      projectId,
      "project-backgrounds",
    );

    if (bgImgRes.error) {
      return {error: true, message: bgImgRes.message};
    }
  } catch (err) {
    console.error("Error processing project images:", err);
    return {error: true, message: "Error processing images"};
  }

  const {error} = await supabase.from("projects").update(transformedData).eq("id", projectId);

  if (error) {
    console.error("Error updating project:", error);
    return {error: true, message: "Error updating project"};
  }

  return {error: false, message: "Project updated successfully"};
};
