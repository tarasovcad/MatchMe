"use server";

import {createClient} from "@/utils/supabase/server";

// Result shape tailored to src/components/(pages)/dashboard/tabs/RequestsTab.tsx
export interface UserRequestForProfileTab {
  id: string;
  project_id: string;
  project_title: string;
  project_slug: string;
  project_logo_url?: string | null;
  created_at: string;
  updated_at: string;
  position_title?: string | null;
  position_id?: string | null;
  direction: "invite" | "application";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  invited_by: string; // inviter name (for invites) or applicant name (for applications)
  created_by_username: string;
  created_by_profile_image_url?: string | null;
  // Cooldown/resend fields for showing resend availability in UI
  resend_count?: number;
  next_allowed_at?: string | null;
  last_sent_at?: string | null;
}

export async function getUserRequests(userId: string): Promise<UserRequestForProfileTab[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();

    // 1) Fetch requests where the given user is the subject (applicant or invitee)
    const {data: requests, error} = await supabase
      .from("project_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {ascending: false});

    if (error) {
      console.error(`Error fetching user requests: ${error.message}`);
      return [];
    }

    if (!requests || requests.length === 0) return [];

    // 2) Collect project ids, position ids, and creator ids
    const projectIds = Array.from(new Set(requests.map((r) => r.project_id).filter(Boolean)));
    const positionIds = Array.from(new Set(requests.map((r) => r.position_id).filter(Boolean)));
    const creatorIds = Array.from(new Set(requests.map((r) => r.created_by).filter(Boolean)));

    // 3) Fetch related data in parallel
    const [projectsRes, positionsRes, creatorsRes] = await Promise.all([
      projectIds.length
        ? supabase.from("projects").select("id, name, slug, project_image").in("id", projectIds)
        : Promise.resolve({data: [], error: null} as const),
      positionIds.length
        ? supabase.from("project_open_positions").select("id, title").in("id", positionIds)
        : Promise.resolve({data: [], error: null} as const),
      creatorIds.length
        ? supabase.from("profiles").select("id, name, username, profile_image").in("id", creatorIds)
        : Promise.resolve({data: [], error: null} as const),
    ]);

    if (projectsRes.error) {
      console.error("Error fetching projects for user requests:", projectsRes.error);
    }
    if (positionsRes.error) {
      console.error("Error fetching positions for user requests:", positionsRes.error);
    }
    if (creatorsRes.error) {
      console.error("Error fetching inviter profiles for user requests:", creatorsRes.error);
    }

    const projectMap = new Map((projectsRes.data || []).map((p) => [p.id, p] as const));
    const positionMap = new Map((positionsRes.data || []).map((pos) => [pos.id, pos] as const));
    const creatorMap = new Map((creatorsRes.data || []).map((c) => [c.id, c] as const));

    const enhanced: UserRequestForProfileTab[] = requests.map((r) => {
      const project = r.project_id ? projectMap.get(r.project_id) : null;
      const position = r.position_id ? positionMap.get(r.position_id) : null;
      const creator = r.created_by ? creatorMap.get(r.created_by) : null;

      return {
        id: r.id,
        project_id: r.project_id,
        project_title: project?.name || "",
        project_slug: project?.slug || "",
        project_logo_url: project?.project_image?.[0]?.url || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
        position_title: position?.title || null,
        position_id: r.position_id || null,
        direction: r.direction,
        status: r.status,
        invited_by: creator?.name || "",
        created_by_username: creator?.username || "",
        created_by_profile_image_url: creator?.profile_image?.[0]?.url || null,
        resend_count: r.resend_count ?? 0,
        next_allowed_at: r.next_allowed_at ?? null,
        last_sent_at: r.last_sent_at ?? null,
      };
    });

    return enhanced;
  } catch (error) {
    console.error("Error in getUserRequests:", error);
    return [];
  }
}
