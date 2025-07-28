"use server";

import {createClient} from "@/utils/supabase/server";
import {getClientIp} from "@/utils/network/getClientIp";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";

export const updateMemberRole = async (projectId: string, memberId: string, newRoleId: string) => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "User not authenticated",
      };
    }

    // Rate limiting
    // const roleUpdateLimit = new Ratelimit({
    //   redis,
    //   limiter: Ratelimit.slidingWindow(10, "5 m"), // 10 attempts per 5 minutes
    //   analytics: true,
    //   prefix: "ratelimit:role-update",
    //   enableProtection: true,
    // });

    // const limit = await roleUpdateLimit.limit(user.id);
    // if (!limit.success) {
    //   return {
    //     error: "Too many role update attempts. Please try again later.",
    //   };
    // }

    // Verify the project exists and user has permission
    const {data: project, error: projectError} = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return {
        error: "Project not found",
      };
    }

    // Check if the new role exists and belongs to this project
    const {data: newRole, error: roleError} = await supabase
      .from("project_roles")
      .select("id, name, project_id, is_system_role")
      .eq("id", newRoleId)
      .eq("project_id", projectId)
      .single();

    if (roleError || !newRole) {
      console.error("Error getting new role:", roleError);
      return {
        error: "Invalid role selected",
      };
    }

    // Check if the member exists in this project
    const {data: member, error: memberError} = await supabase
      .from("project_team_members")
      .select("user_id, role_id")
      .eq("project_id", projectId)
      .eq("user_id", memberId)
      .single();

    if (memberError || !member) {
      return {
        error: "Member not found in this project",
      };
    }

    const {data: currentUserMember, error: currentUserError} = await supabase
      .from("project_team_members")
      .select("role_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (currentUserError || !currentUserMember) {
      return {
        error: "You don't have permission to change member roles",
      };
    }

    // Get current user's role to check permissions
    const {data: currentUserRole, error: currentUserRoleError} = await supabase
      .from("project_roles")
      .select("name, permissions")
      .eq("id", currentUserMember.role_id)
      .single();

    if (currentUserRoleError || !currentUserRole) {
      return {
        error: "Unable to verify your permissions",
      };
    }

    // Check if user is trying to change their own role (prevent self-demotion)
    if (memberId === user.id) {
      return {
        error: "You cannot change your own role",
      };
    }

    // Check if user is trying to change the project creator's role
    if (memberId === project.user_id) {
      return {
        error: "Cannot change the project creator's role",
      };
    }

    // Check if the new role is the same as current role
    if (member.role_id === newRoleId) {
      return {
        error: "Member already has this role",
      };
    }

    // Update the member's role
    const {error: updateError} = await supabase
      .from("project_team_members")
      .update({
        role_id: newRoleId,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", projectId)
      .eq("user_id", memberId);

    if (updateError) {
      console.error("Error updating member role:", updateError);
      return {
        error: "Failed to update member role",
      };
    }

    return {
      error: null,
      message: `Member role updated to ${newRole.name}`,
    };
  } catch (error) {
    console.error("updateMemberRole unexpected error:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
