"use server";

import {createClient} from "@/utils/supabase/server";
import {
  positionValidationSchema,
  PositionFormData,
} from "@/validation/positions/positionValidation";
import {getActivePositionsCount} from "./getProjectOpenPositions";

const NUMBER_OF_ACTIVE_POSITIONS_LIMIT = 5;

export async function createOpenPosition(projectId: string, formData: PositionFormData) {
  try {
    // Validate the form data
    const validatedData = positionValidationSchema.parse(formData);

    // Check if the project has reached the active positions limit
    const {count: activePositionsCount, error: countError} =
      await getActivePositionsCount(projectId);

    if (countError) {
      return {
        success: false,
        error: "Unable to verify position limit. Please try again.",
      };
    }

    if (activePositionsCount >= NUMBER_OF_ACTIVE_POSITIONS_LIMIT) {
      return {
        success: false,
        error: `You've reached the maximum limit of ${NUMBER_OF_ACTIVE_POSITIONS_LIMIT} active positions. Please close an existing position before creating a new one.`,
      };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user for posted_by_user_id
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

    // Map the validation schema fields to database columns
    const insertData = {
      project_id: projectId,
      title: validatedData.title,
      description: validatedData.description,
      requirements: validatedData.requirements,
      required_skills: validatedData.required_skills,
      experience_level: validatedData.experience_level,
      time_commitment: validatedData.time_commitment,
      status: validatedData.status,
      posted_by_user_id: user.id,
    };

    const {data, error} = await supabase
      .from("project_open_positions")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating open position:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      console.error("No data returned - likely blocked by RLS");
      return {
        success: false,
        error:
          "Unable to create position. You may not have permission to create positions for this project.",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Validation or server error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
