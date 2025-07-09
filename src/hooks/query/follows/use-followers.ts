import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";
import {MatchMeUser} from "@/types/user/matchMeUser";

// Fetch followers for a specific user
const fetchFollowers = async (userId: string): Promise<MatchMeUser[]> => {
  // First, get all follower IDs
  const {data: followsData, error: followsError} = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (followsError) {
    throw new Error(`Error fetching followers: ${followsError.message}`);
  }

  if (!followsData || followsData.length === 0) {
    return [];
  }

  // Extract follower IDs
  const followerIds = followsData.map((follow) => follow.follower_id);

  // Then fetch the full profile data for those users
  const {data: profilesData, error: profilesError} = await supabase
    .from("profiles")
    .select("*")
    .in("id", followerIds);
  // .eq("is_profile_public", true);

  if (profilesError) {
    throw new Error(`Error fetching follower profiles: ${profilesError.message}`);
  }

  return profilesData || [];
};

// Fetch following for a specific user
const fetchFollowing = async (userId: string): Promise<MatchMeUser[]> => {
  // First, get all following IDs
  const {data: followsData, error: followsError} = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (followsError) {
    throw new Error(`Error fetching following: ${followsError.message}`);
  }

  if (!followsData || followsData.length === 0) {
    return [];
  }

  // Extract following IDs
  const followingIds = followsData.map((follow) => follow.following_id);

  // Then fetch the full profile data for those users
  const {data: profilesData, error: profilesError} = await supabase
    .from("profiles")
    .select("*")
    .in("id", followingIds)
    .eq("is_profile_public", true);

  if (profilesError) {
    throw new Error(`Error fetching following profiles: ${profilesError.message}`);
  }

  return profilesData || [];
};

export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => fetchFollowers(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => fetchFollowing(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};
