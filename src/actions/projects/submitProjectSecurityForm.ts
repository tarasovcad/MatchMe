"use server";

import {createClient} from "@/utils/supabase/server";
import {ProjectSecurityFormData} from "@/validation/project/projectSecurityValidation";

export const submitProjectSecurityForm = async (
  projectId: string,
  formData: Partial<ProjectSecurityFormData>,
) => {
  try {
    const supabase = await createClient();

    // Fetch current slug & last change timestamp
    const {data: project, error: fetchError} = await supabase
      .from("projects")
      .select("slug, slug_changed_at")
      .eq("id", projectId)
      .single();

    if (fetchError || !project) {
      console.error("Error fetching project:", fetchError);
      return {error: true, message: "Error fetching project data"};
    }

    const newSlug = formData.slug?.trim().toLowerCase();

    if (!newSlug || newSlug === project.slug) {
      return {error: true, message: "Nothing to update"};
    }

    // Enforce 1-month cooldown between slug changes
    if (project.slug_changed_at) {
      const lastChanged = new Date(project.slug_changed_at);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastChanged > oneMonthAgo) {
        return {error: true, message: "You can only change the slug once a month."};
      }
    }

    // Ensure slug is unique
    const {count} = await supabase
      .from("projects")
      .select("id", {head: true, count: "exact"})
      .eq("slug", newSlug);

    if (count && count > 0) {
      return {error: true, message: "Slug is already taken"};
    }

    const updates = {
      slug: newSlug,
      slug_changed_at: new Date().toISOString(),
    } as const;

    const {error: updateError} = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select();

    if (updateError) {
      console.error("Error updating slug:", updateError);
      return {error: true, message: "Error updating project slug"};
    }

    return {
      error: null,
      message: "Project slug updated successfully",
      slug_changed_at: updates.slug_changed_at,
    };
  } catch (err) {
    console.error("Unexpected error updating slug:", err);
    return {error: true, message: "Unexpected error while updating slug"};
  }
};
