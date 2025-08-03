"use server";

import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {createClient} from "@/utils/supabase/server";

export const getProjectOpenPositions = async (projectId: string) => {
  try {
    if (!projectId) {
      return {error: "Project ID is required", data: null};
    }

    const supabase = await createClient();

    // 1. Fetch open positions for this project
    const {data: positions, error: positionsError} = await supabase
      .from("project_open_positions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", {ascending: false});

    if (positionsError) {
      console.error("getProjectOpenPositions – positions error", positionsError);
      return {error: positionsError.message, data: null};
    }

    if (!positions?.length) {
      return {error: null, data: []};
    }

    // 2. Get unique posted_by_user_ids to fetch poster names
    const posterIds = positions
      .map((p) => p.posted_by_user_id)
      .filter((id): id is string => id !== null);
    const uniquePosterIds = Array.from(new Set(posterIds));

    let postersMap = new Map<string, {name: string; username: string}>();

    if (uniquePosterIds.length > 0) {
      const {data: posters, error: postersError} = await supabase
        .from("profiles")
        .select("id, name, username")
        .in("id", uniquePosterIds);

      if (postersError) {
        console.error("getProjectOpenPositions – posters error", postersError);
        // Continue without poster info rather than failing completely
      } else if (posters) {
        postersMap = new Map(posters.map((p) => [p.id, {name: p.name, username: p.username}]));
      }
    }

    const enrichedPositions: ProjectOpenPosition[] = positions.map((position) => {
      const poster = position.posted_by_user_id ? postersMap.get(position.posted_by_user_id) : null;

      return {
        ...position,
        posted_by_name: poster?.name || null,
        posted_by_username: poster?.username || null,
        applicant_count: 0, // TODO: Calculate from applications table
      };
    });

    return {error: null, data: enrichedPositions};
  } catch (err) {
    console.error("getProjectOpenPositions unexpected error", err);
    return {
      error: err instanceof Error ? err.message : "Unexpected error",
      data: null,
    };
  }
};
