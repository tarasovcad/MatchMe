"use server";

import {createClient} from "@/utils/supabase/server";

export const deleteProject = async (projectId: string) => {
  try {
    const supabase = await createClient();

    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Unable to fetch authenticated user while deleting project:", authError);
      return {
        error: authError ?? new Error("User not authenticated"),
        message: "You must be signed in to delete a project",
      };
    }

    // ---------------------------------------------------------------------
    // Check if the project has **active** team members other than the owner.
    // Owners are not allowed to delete a project while other members exist.
    // ---------------------------------------------------------------------

    const {data: otherMembers, error: membersError} = await supabase
      .from("project_team_members")
      .select("id", {head: false})
      .eq("project_id", projectId)
      .neq("user_id", user.id) // exclude owner/requester
      .eq("is_active", true);

    if (membersError) {
      console.error("Error checking project members before delete:", membersError);
      return {error: membersError, message: "Error checking project members"};
    }

    if (otherMembers && otherMembers.length > 0) {
      return {
        error: true,
        message: "Cannot delete a project that still has team members.",
      };
    }

    const {error} = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      return {error, message: "Error deleting project"};
    }

    return {
      error: null,
      message: "Project deleted successfully",
    };
  } catch (error) {
    console.error("Unexpected error deleting project:", error);
    return {error, message: "Error deleting project"};
  }
};
