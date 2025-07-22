"use server";

import {createClient} from "@/utils/supabase/server";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";

// Very lightweight: loop through provided roles and update by primary key (id).
export const updateProjectRoles = async (projectId: string, roles: Partial<ProjectRoleDb>[]) => {
  if (!projectId || roles.length === 0) {
    return {error: true, message: "Nothing to update"};
  }

  const supabase = await createClient();

  for (const role of roles) {
    if (!role.id) continue;

    const {id, ...updates} = role;

    const {error} = await supabase
      .from("project_roles")
      .update({...updates, updated_at: new Date().toISOString()})
      .eq("id", id)
      .eq("project_id", projectId);

    if (error) {
      return {error: true, message: error.message};
    }
  }

  return {error: null, message: "Roles updated"};
};
