"use server";

import {createClient} from "@/utils/supabase/server";

export interface ProjectRoleDb {
  id: string;
  project_id: string;
  name: string;
  badge_color: string | null;
  is_default: boolean | null;
  is_system_role: boolean | null;
  permissions: Record<string, Record<string, boolean>>; // { [resource: string]: { [action: string]: boolean } }
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all roles for a given project
 */
export async function getAllProjectRoles(projectId: string) {
  try {
    if (!projectId) {
      return {error: "Project ID is required"};
    }

    const supabase = await createClient();

    const {data, error} = await supabase
      .from("project_roles")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", {ascending: true});

    if (error) {
      return {error: error.message};
    }

    return {error: null, data: data as ProjectRoleDb[]};
  } catch (err) {
    console.error("getProjectRolesAction unexpected error", err);
    return {error: err instanceof Error ? err.message : "Unexpected error"};
  }
}
