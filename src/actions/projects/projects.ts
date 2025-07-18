"use server";

import {createClient} from "@/utils/supabase/server";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";

const TABLE_NAME = "projects";

export async function getAllProjects(
  page = 1,
  perPage: number,
  pageFilters?: SerializableFilter[],
) {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase.from(TABLE_NAME).select("*");

  // Apply filters if provided
  if (pageFilters && pageFilters.length > 0) {
    query = applyFiltersToSupabaseQuery(query, pageFilters);
  }

  // Apply pagination
  query = query.range(from, to);
  const {data, error: profilesError} = await query;

  if (profilesError) {
    console.error("Supabase query error:", profilesError);
    throw new Error(`Error fetching projects: ${profilesError.message}`);
  }
  if (!data) {
    console.warn("No data returned from Supabase");
    return [];
  }

  return data;
}

export async function getUserProjects(userId: string) {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {ascending: false});

  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Error fetching user projects: ${error.message}`);
  }

  return data || [];
}

// Check if a user has access to a project by slug
export async function checkProjectAccess(slug: string, userId: string) {
  const supabase = await createClient();

  // First, get the project by slug
  const {data: project, error: projectError} = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("slug", slug)
    .single();

  if (projectError || !project) {
    return null;
  }

  // Check if user is project owner
  const isOwner = project.user_id === userId;

  if (isOwner) {
    return {
      projectData: project,
      userPermission: "owner",
      isOwner: true,
    };
  }

  // Check if user is an active team member
  const {data: teamMember, error: teamError} = await supabase
    .from("project_team_members")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (teamError || !teamMember) {
    return null; // User has no access
  }

  return {
    projectData: project,
    userPermission: teamMember.permission,
    isOwner: false,
  };
}
