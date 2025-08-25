"use server";

import {createClient} from "@/utils/supabase/server";
import {getClientIp} from "@/utils/network/getClientIp";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
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

  // Auth check
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) {
    return {error: true, message: "Not authenticated"};
  }

  // Rate limiting
  const ip = await getClientIp();

  const updateRolesLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"), // 5 attempts per 5 minutes per user
    analytics: true,
    prefix: "ratelimit:update-roles",
    enableProtection: true,
  });

  const updateRolesIpLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"), // 10 attempts per 10 minutes per IP
    analytics: true,
    prefix: "ratelimit:ip:update-roles",
    enableProtection: true,
  });

  const [userLimit, ipLimit] = await Promise.all([
    updateRolesLimit.limit(user.id),
    updateRolesIpLimit.limit(ip),
  ]);

  if (!userLimit.success || !ipLimit.success) {
    return {
      error: true,
      message: "Too many role update attempts. Please try again later.",
    };
  }

  // Active membership required
  const {data: member, error: memberErr} = await supabase
    .from("project_team_members")
    .select("role_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberErr || !member) {
    return {error: true, message: "Restricted Access"};
  }

  // Resolve role id: explicit or default
  let roleId = member.role_id as string | null;
  if (!roleId) {
    const {data: defaultRole} = await supabase
      .from("project_roles")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_default", true)
      .limit(1)
      .maybeSingle();
    roleId = defaultRole?.id ?? null;
  }

  if (!roleId) {
    return {error: true, message: "Restricted Access"};
  }

  // Fetch permissions for role and check capabilities
  const {data: role} = await supabase
    .from("project_roles")
    .select("permissions")
    .eq("id", roleId)
    .maybeSingle();

  const rolesPermissions = role?.permissions?.["Roles & Permissions"];
  const canCreate = rolesPermissions?.create === true;
  const canUpdate = rolesPermissions?.update === true;
  const canDelete = rolesPermissions?.delete === true;

  // Analyze operations to determine required permissions
  let needsCreate = false;
  let needsUpdate = false;
  let needsDelete = false;

  for (const roleData of roles) {
    if ((roleData as DeletedRole)._deleted) {
      needsDelete = true;
    } else if ((roleData.id as string)?.startsWith("temp-")) {
      needsCreate = true;
    } else {
      needsUpdate = true;
    }
  }

  // Check permissions for required operations
  if (needsCreate && !canCreate) {
    return {error: true, message: "Insufficient permissions to create roles"};
  }
  if (needsUpdate && !canUpdate) {
    return {error: true, message: "Insufficient permissions to update roles"};
  }
  if (needsDelete && !canDelete) {
    return {error: true, message: "Insufficient permissions to delete roles"};
  }

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
