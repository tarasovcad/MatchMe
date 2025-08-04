"use server";

import {createClient} from "@/utils/supabase/server";
import {
  positionValidationSchema,
  PositionFormData,
} from "@/validation/positions/positionValidation";

export async function updateOpenPosition(
  positionId: string,
  projectId: string,
  formData: PositionFormData,
) {
  try {
    // Validate the form data
    const validatedData = positionValidationSchema.parse(formData);

    // Create Supabase client
    const supabase = await createClient();

    // Get current user for permission check
    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Verify the position exists and user has permission to update it
    const {data: existingPosition, error: positionError} = await supabase
      .from("project_open_positions")
      .select("id, project_id")
      .eq("id", positionId)
      .eq("project_id", projectId)
      .single();

    if (positionError || !existingPosition) {
      return {
        success: false,
        error: "Position not found or you don't have permission to update it",
      };
    }

    // Map the validation schema fields to database columns for update
    const updateData = {
      title: validatedData.title,
      description: validatedData.description,
      requirements: validatedData.requirements,
      required_skills: validatedData.required_skills,
      experience_level: validatedData.experience_level,
      time_commitment: validatedData.time_commitment,
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await supabase
      .from("project_open_positions")
      .update(updateData)
      .eq("id", positionId)
      .eq("project_id", projectId)
      .select();

    if (error) {
      console.error("Error updating open position:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      console.error("No data returned - likely blocked by RLS");
      return {
        success: false,
        error: "Unable to update position. You may not have permission to update this position.",
      };
    }

    return {
      success: true,
      data: data[0],
    };
  } catch (error) {
    console.error("Validation or server error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
