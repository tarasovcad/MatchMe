"use server";

import {MatchMeUser} from "@/types/user/matchMeUser";
import {createClient} from "@/utils/supabase/server";

interface ProfileRequest {
  id: string;
  name: string;
  username: string;
  profile_image: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    url: string;
  }[];
  work_availability?: number;
  location?: string;
  languages?: string[];
  personal_website?: string;
  skills?: string[];
  years_of_experience?: number;
  seniority_level?: string;
}

export async function getProjectRequests(projectId: string) {
  const supabase = await createClient();

  // 1. Fetch project requests
  const {data: requests, error} = await supabase
    .from("project_requests")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", {ascending: false});

  if (error) {
    throw new Error(`Error fetching project requests: ${error.message}`);
  }

  if (!requests?.length) {
    return [];
  }

  // 2. Collect all user IDs (user_id and created_by) and position IDs
  const userIdsSet = new Set<string>();
  const positionIdsSet = new Set<string>();

  for (const request of requests) {
    if (request.user_id) userIdsSet.add(request.user_id);
    if (request.created_by) userIdsSet.add(request.created_by);
    if (request.position_id) positionIdsSet.add(request.position_id);
  }

  const userIds = Array.from(userIdsSet);
  const positionIds = Array.from(positionIdsSet);

  // 3. Fetch user profiles if we have user IDs
  let profiles: ProfileRequest[] = [];
  if (userIds.length > 0) {
    const {data: profilesData, error: profilesError} = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        username,
        profile_image,
        work_availability,
        location,
        languages,
        personal_website,
        skills,
        years_of_experience,
        seniority_level
      `,
      )
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      // Continue without profiles rather than throwing error
    } else {
      profiles = profilesData || [];
    }
  }

  // 4. Fetch position titles if we have position IDs
  let positions: {id: string; title: string}[] = [];
  if (positionIds.length > 0) {
    const {data: positionsData, error: positionsError} = await supabase
      .from("project_open_positions")
      .select("id, title")
      .in("id", positionIds);

    if (positionsError) {
      console.error("Error fetching position titles:", positionsError);
      // Continue without positions rather than throwing error
    } else {
      positions = positionsData || [];
    }
  }

  // 5. Create maps for quick lookup
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const positionMap = new Map(positions.map((position) => [position.id, position]));

  // 6. Enhance requests with user profile data and position titles
  const enhancedRequests = requests.map((request) => {
    const userProfile = request.user_id ? profileMap.get(request.user_id) : null;
    const createdByProfile = request.created_by ? profileMap.get(request.created_by) : null;
    const position = request.position_id ? positionMap.get(request.position_id) : null;

    return {
      ...request,
      // User who made the request
      user_name: userProfile?.name || null,
      user_username: userProfile?.username || null,
      user_profile_image: userProfile?.profile_image || null,
      user_work_availability: userProfile?.work_availability || null,
      user_location: userProfile?.location || null,
      user_languages: userProfile?.languages || null,
      user_personal_website: userProfile?.personal_website || null,
      user_skills: userProfile?.skills || null,
      user_years_of_experience: userProfile?.years_of_experience || null,
      user_seniority_level: userProfile?.seniority_level || null,
      // User who created the request (if different)
      created_by_name: createdByProfile?.name || null,
      created_by_username: createdByProfile?.username || null,
      created_by_profile_image: createdByProfile?.profile_image || null,
      // Position information
      position_title: position?.title || null,
    };
  });

  return enhancedRequests;
}
