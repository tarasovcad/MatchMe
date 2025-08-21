"use server";

import {createClient} from "@/utils/supabase/server";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";

interface DeletedRole {
  id: string;
  _deleted: true;
}

export type UpdatableRole = Partial<ProjectRoleDb> | DeletedRole;

export const updateProjectRoles = async (projectId: string, roles: UpdatableRole[]) => {
  if (!projectId || roles.length === 0) {
    return {error: true, message: "Nothing to update"};
  }

  const supabase = await createClient();

  for (const role of roles) {
    if (!role.id) continue;

    // Handle deletion
    if ((role as DeletedRole)._deleted) {
      // If it's a temporary role that was never persisted, just skip
      if ((role.id as string).startsWith("temp-")) {
        continue;
      }

      const {error} = await supabase
        .from("project_roles")
        .delete()
        .eq("id", role.id)
        .eq("project_id", projectId);

      if (error) {
        return {error: true, message: error.message};
      }
      // Skip to next role
      continue;
    }

    // Check if this is a new role
    const isNewRole = (role.id as string).startsWith("temp-");

    if (isNewRole) {
      // Insert new role (exclude the temporary id)
      const {id, created_at, updated_at, ...insertData} = role as Partial<ProjectRoleDb>;

      const {error} = await supabase.from("project_roles").insert({
        ...insertData,
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return {error: true, message: error.message};
      }
    } else {
      // Update existing role
      const {id, ...updates} = role as Partial<ProjectRoleDb>;

      const {error} = await supabase
        .from("project_roles")
        .update({...updates, updated_at: new Date().toISOString()})
        .eq("id", id)
        .eq("project_id", projectId);

      if (error) {
        return {error: true, message: error.message};
      }
    }
  }

  return {error: null, message: "Roles updated"};
};
