"use server";

import {createClient} from "@/utils/supabase/server";

export const deleteOpenPosition = async (positionId: string, projectId: string) => {
  try {
    const supabase = await createClient();

    // Get current user for permission check
    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "User not authenticated",
        message: "You must be signed in to delete a position",
      };
    }

    // Verify the position exists and user has permission to delete it
    const {data: existingPosition, error: positionError} = await supabase
      .from("project_open_positions")
      .select("id, title, project_id")
      .eq("id", positionId)
      .eq("project_id", projectId)
      .single();

    if (positionError || !existingPosition) {
      return {
        error: "Position not found or you don't have permission to delete it",
        message: "Position not found or you don't have permission to delete it",
      };
    }

    // Delete the position
    const {error: deleteError} = await supabase
      .from("project_open_positions")
      .delete()
      .eq("id", positionId)
      .eq("project_id", projectId);

    if (deleteError) {
      console.error("Error deleting open position:", deleteError);
      return {
        error: deleteError.message,
        message: "Failed to delete position",
      };
    }

    return {
      error: null,
      message: `Position "${existingPosition.title}" deleted successfully`,
    };
  } catch (error) {
    console.error("Unexpected error deleting position:", error);
    return {
      error: "An unexpected error occurred",
      message: "Failed to delete position",
    };
  }
};
