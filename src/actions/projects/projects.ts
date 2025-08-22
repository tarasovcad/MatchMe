"use server";

import {createClient} from "@/utils/supabase/server";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

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

export async function checkProjectAccess(slug: string, userId: string) {
  const supabase = await createClient();

  const ip = await getClientIp();

  const userRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 checks per minute per user
    analytics: true,
    prefix: "ratelimit:user:project-access-check",
    enableProtection: true,
  });

  const ipRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 checks per minute per IP
    analytics: true,
    prefix: "ratelimit:ip:project-access-check",
    enableProtection: true,
  });

  const [userLimit, ipLimit] = await Promise.all([
    userRateLimiter.limit(userId),
    ipRateLimiter.limit(ip),
  ]);

  if (!userLimit.success || !ipLimit.success) {
    console.warn("Rate limit exceeded for checkProjectAccess", {
      userId,
      ip,
      userRemaining: userLimit.remaining,
      ipRemaining: ipLimit.remaining,
    });
    return null;
  }

  // First, get the project by slug
  const {data: project, error: projectError} = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("slug", slug)
    .single();

  if (projectError || !project) {
    return null; // Project not found ->  404
  }

  // Determine owner (for convenience), but do not special-case permissions fetch
  const isOwner = project.user_id === userId;

  // Fetch active team membership for this user in the project
  const {data: teamMember, error: teamError} = await supabase
    .from("project_team_members")
    .select("user_id, role_id")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .single();

  if (teamError || !teamMember) {
    return null;
  }

  // Fetch the role and its permissions
  type RoleWithPermissions = {
    id: string;
    name: string;
    permissions: Record<string, Record<string, boolean>>;
  };

  let role: RoleWithPermissions | null = null;
  if (teamMember.role_id) {
    const {data: roleRow} = await supabase
      .from("project_roles")
      .select("id, name, permissions")
      .eq("id", teamMember.role_id)
      .maybeSingle();
    if (roleRow) {
      role = roleRow as RoleWithPermissions;
    }
  }

  // If no role assigned, try to fall back to the default role for the project
  if (!role) {
    const {data: defaultRole} = await supabase
      .from("project_roles")
      .select("id, name, permissions")
      .eq("project_id", project.id)
      .eq("is_default", true)
      .limit(1)
      .maybeSingle();
    if (defaultRole) {
      role = defaultRole as RoleWithPermissions;
    }
  }

  return {
    projectData: project,
    userPermission: role?.name?.toLowerCase?.() ?? "member",
    isOwner,
    role: role ? {id: role.id, name: role.name} : {id: null as unknown as string, name: "Member"},
    permissions: role?.permissions ?? null,
  } as const;
}
