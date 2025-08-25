"use server";

import {createClient} from "@/utils/supabase/server";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

export const getProjectOpenPositionsMinimal = async (
  projectId: string,
  userId?: string,
): Promise<{error: string | null; data: ProjectOpenPosition[] | null}> => {
  try {
    if (!projectId) {
      return {error: "Project ID is required", data: null};
    }
    const supabase = await createClient();

    const [positionsRes, requestsRes, favoritesRes, lastAppRes, pendingInviteRes] =
      await Promise.all([
        supabase
          .from("project_open_positions")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", {ascending: false}),
        userId
          ? supabase
              .from("project_requests")
              .select("position_id, status")
              .eq("project_id", projectId)
              .eq("user_id", userId)
              .eq("direction", "application")
          : Promise.resolve({data: null, error: null}),
        userId
          ? supabase
              .from("favorites_open_positions")
              .select("favorite_position_id")
              .eq("user_id", userId)
          : Promise.resolve({data: null, error: null}),
        userId
          ? supabase
              .from("project_requests")
              .select("next_allowed_at")
              .eq("project_id", projectId)
              .eq("user_id", userId)
              .eq("direction", "application")
              .order("updated_at", {ascending: false})
              .limit(1)
              .maybeSingle()
          : Promise.resolve({data: null, error: null}),
        userId
          ? supabase
              .from("project_requests")
              .select("id")
              .eq("project_id", projectId)
              .eq("user_id", userId)
              .eq("direction", "invite")
              .eq("status", "pending")
              .maybeSingle()
          : Promise.resolve({data: null, error: null}),
      ]);

    const positions = positionsRes.data;
    const positionsError = positionsRes.error;

    if (positionsError) {
      return {error: positionsError.message, data: null};
    }

    if (!positions || positions.length === 0) {
      return {error: null, data: []};
    }

    const posterIds = Array.from(
      new Set((positions ?? []).map((p) => p.posted_by_user_id).filter(Boolean) as string[]),
    );

    const allRequiredSkills = Array.from(
      new Set(
        positions
          .flatMap((p) => (Array.isArray(p.required_skills) ? p.required_skills : []))
          .filter(Boolean) as string[],
      ),
    );

    const [postersRes, skillsRes] = await Promise.all([
      posterIds.length > 0
        ? supabase.from("profiles").select("id, name, username, profile_image").in("id", posterIds)
        : Promise.resolve({data: [], error: null} as const),
      allRequiredSkills.length > 0
        ? supabase.from("skills").select("name, image_url").in("name", allRequiredSkills)
        : Promise.resolve({data: [], error: null} as const),
    ]);

    let postersMap = new Map();
    if (!postersRes.error && postersRes.data) {
      const posters = postersRes.data;
      postersMap = new Map(
        posters.map((p) => [
          p.id,
          {
            name: p.name ?? null,
            username: p.username ?? null,
            profile_image: p.profile_image ?? null,
          },
        ]),
      );
    }

    let skillImageMap = new Map<string, {name: string; image_url?: string}>();
    if (!skillsRes.error && skillsRes.data) {
      skillImageMap = new Map(
        (skillsRes.data as Array<{name: string; image_url?: string}>).map((s) => [
          s.name,
          {name: s.name, image_url: s.image_url},
        ]),
      );
    }
    const pendingByPosition = new Set<string>();
    const requests = requestsRes.data as Array<{position_id: string | null; status: string}> | null;
    let hasAnyPendingRequest = false;

    if (requests) {
      requests.forEach((r) => {
        if (r.position_id && r.status === "pending") {
          pendingByPosition.add(r.position_id);
          hasAnyPendingRequest = true;
        }
      });
    }

    const savedByPosition = new Set<string>();
    const favorites = favoritesRes.data as Array<{favorite_position_id: string | null}> | null;
    if (favorites) {
      favorites.forEach((f) => {
        if (f.favorite_position_id) {
          savedByPosition.add(f.favorite_position_id);
        }
      });
    }

    const viewerNextAllowedAt: string | null | undefined =
      lastAppRes?.data?.next_allowed_at ?? null;
    const now = new Date();
    const cooldownActive = viewerNextAllowedAt
      ? new Date(viewerNextAllowedAt).getTime() > now.getTime()
      : false;

    // Get the title of the position that has a pending request (if any)
    const pendingPositionTitle =
      hasAnyPendingRequest && positions
        ? positions.find((p) => pendingByPosition.has(p.id))?.title || null
        : null;

    const viewerHasPendingInvite = Boolean(pendingInviteRes?.data?.id);

    const annotated: ProjectOpenPosition[] = (positions ?? []).map((p) => {
      const poster = p.posted_by_user_id ? postersMap.get(p.posted_by_user_id) : undefined;
      const requiredSkills: string[] = Array.isArray(p.required_skills)
        ? (p.required_skills as string[])
        : [];
      const required_skills_with_images = requiredSkills.map(
        (skillName: string) => skillImageMap.get(skillName) || {name: skillName},
      );

      return {
        ...p,
        posted_by_name: poster?.name ?? null,
        posted_by_username: poster?.username ?? null,
        posted_by_profile_image: poster?.profile_image ?? null,
        has_pending_request: pendingByPosition.has(p.id),
        has_any_pending_request: hasAnyPendingRequest,
        pending_position_title: pendingPositionTitle,
        required_skills_with_images,
        is_saved: userId ? savedByPosition.has(p.id) : false,
        application_cooldown_active: Boolean(userId && cooldownActive),
        application_cooldown_until: userId && viewerNextAllowedAt ? viewerNextAllowedAt : null,
        viewer_has_pending_invite: Boolean(userId && viewerHasPendingInvite),
      };
    });
    return {error: null, data: annotated};
  } catch (err) {
    console.error("getProjectOpenPositionsMinimal unexpected error", err);
    return {
      error: err instanceof Error ? err.message : "Unexpected error",
      data: null,
    };
  }
};
