"use server";

import {createClient} from "@/utils/supabase/server";
import {processSingleImageField} from "../utils/processImageField";
import {processMultipleImageField} from "../utils/processImageField";
import {canMakePublic} from "@/functions/canMakePublic";
import {Project} from "@/types/projects/projects";

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

    // Handle demo images (up to 5)
    const demoRes = await processMultipleImageField(
      transformedData,
      "demo",
      projectId,
      "project-demo-images",
    );

    if (demoRes.error) {
      return {error: true, message: demoRes.message};
    }
  } catch (err) {
    console.error("Error processing project images:", err);
    return {error: true, message: "Error processing images"};
  }

  // ---------------------------------------------------------------------------
  // Backend validation: ensure project can't be made public if incomplete
  // ---------------------------------------------------------------------------

  // Fetch current project to merge with incoming updates
  const {data: currentProject} = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  let wasAutomaticallySetToPrivate = false;

  if (currentProject) {
    const updatedProjectState = {
      ...currentProject,
      ...transformedData,
    } as Project;

    const {canMakePublic: canMakeProjectPublic} = canMakePublic(updatedProjectState);

    // Scenario 1: explicit attempt to set public while incomplete
    if (transformedData.is_project_public === true && !canMakeProjectPublic) {
      transformedData.is_project_public = false;
      wasAutomaticallySetToPrivate = true;
    }
    // Scenario 2: project currently public but will become incomplete after updates
    else if (
      currentProject.is_project_public === true &&
      !canMakeProjectPublic &&
      transformedData.is_project_public !== false
    ) {
      transformedData.is_project_public = false;
      wasAutomaticallySetToPrivate = true;
      console.warn(
        `Project ${projectId} was public but became incomplete after updates – forced to private`,
      );
    }
  }

  const {error} = await supabase.from("projects").update(transformedData).eq("id", projectId);

  if (error) {
    console.error("Error updating project:", error);
    return {error: true, message: "Error updating project"};
  }

  return {
    error: false,
    message: "Project updated successfully",
    projectSetToPrivate: wasAutomaticallySetToPrivate,
  };
};
