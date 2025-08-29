"use client";

import React, {useCallback, useMemo, useState} from "react";
import {User} from "@supabase/supabase-js";
import {Project} from "@/types/projects/projects";
import {useQuery} from "@tanstack/react-query";
import {
  getProjectFollowers,
  getProjectFollowersCount,
  ProjectFollowerWithStatus,
} from "@/actions/(follows)/getProjectFollowers";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import ProfileMiniCard from "../../profiles/ProfileMiniCard";
import ProfileMiniCardSkeleton from "../../profiles/ProfileMiniCardSkeleton";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";

const ProjectManagementFollowersTab = ({project, user}: {project: Project; user: User}) => {
  const [loading, setLoading] = useState<{initial: boolean; more: boolean}>({
    initial: false,
    more: false,
  });

  const pageKey = useMemo(() => `project-followers-${project.id}`, [project.id]);

  const {data: followersCount = 0} = useQuery({
    queryKey: ["project-followers-count", project.id],
    queryFn: () => getProjectFollowersCount(project.id),
    enabled: !!project.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const fetchItems = useCallback(
    async (
      page: number,
      itemsPerPage: number,
      filters?: import("@/store/filterStore").SerializableFilter[],
    ) => {
      const isInitial = page === 1;
      setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: true}));
      try {
        return await getProjectFollowers(project.id, page, itemsPerPage, filters, user.id);
      } finally {
        setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: false}));
      }
    },
    [project.id, user.id],
  );

  const renderFollowerItem = (
    profile: ProjectFollowerWithStatus,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
  ) => {
    const isFollowing = profile.isFollowedBy ?? false;
    const isFollowingBack = profile.isFollowingBack ?? false;

    return (
      <div ref={isLast ? ref : null} key={profile.id}>
        <ProfileMiniCard
          member={{...profile, user_id: profile.id}}
          customFollowButton={
            <AuthGate userSessionId={user.id}>
              <FollowUserButton
                followingId={profile.id}
                isFollowing={isFollowing}
                isFollowingBack={isFollowingBack}
                userSessionId={user.id}
                username={profile.username}
                simpleStyle={true}
                hideIcons={true}
                followVariant={"secondary"}
                unfollowVariant={"outline"}
                size="xs"
                buttonClassName="flex-1 max-w-[126px]"
              />
            </AuthGate>
          }
          userSessionId={user.id}
        />
      </div>
    );
  };

  const customSearchInput = <SearchInputPage key={pageKey} pageKey={pageKey} loading={loading} />;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h4 className="font-medium text-foreground/90 text-lg">Followers</h4>
          <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
            {followersCount}
          </div>
        </div>
        <div className="flex items-center gap-2 max-w-[344px] w-full">{customSearchInput}</div>
      </div>

      <InfiniteItemLoader<ProjectFollowerWithStatus>
        userSession={user}
        fetchItems={fetchItems}
        renderItem={renderFollowerItem}
        renderSkeleton={() => <ProfileMiniCardSkeleton />}
        type="profiles"
        itemsPerPage={15}
        displayFilterButton={false}
        displaySearch={false}
        pageKey={pageKey}
        cacheKey={pageKey}
        syncFiltersWithUrl={false}
      />
    </div>
  );
};

export default ProjectManagementFollowersTab;
