"use server";

import {createClient} from "@/utils/supabase/server";
import {processSingleImageField} from "../utils/processImageField";
import {processMultipleImageField} from "../utils/processImageField";
import {canMakePublic} from "@/functions/canMakePublic";
import {Project} from "@/types/projects/projects";

export const submitProjectForm = async (projectId: string, formData: Record<string, unknown>) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) {
    return {error: true, message: "Not authenticated"};
  }

  // Active membership required
  const {data: member, error: memberErr} = await supabase
    .from("project_team_members")
    .select("role_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberErr || !member) {
    return {error: true, message: "Restricted Access"};
  }

  // Resolve role id: explicit or default
  let roleId = member.role_id as string | null;
  if (!roleId) {
    const {data: defaultRole} = await supabase
      .from("project_roles")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_default", true)
      .limit(1)
      .maybeSingle();
    roleId = defaultRole?.id ?? null;
  }

  if (!roleId) {
    return {error: true, message: "Restricted Access"};
  }

  // Fetch permissions for role and check capability
  const {data: role} = await supabase
    .from("project_roles")
    .select("permissions")
    .eq("id", roleId)
    .maybeSingle();

  const canUpdateProjectDetails = role?.permissions?.["Project Details"]?.update === true;
  if (!canUpdateProjectDetails) {
    return {error: true, message: "Restricted Access"};
  }

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
