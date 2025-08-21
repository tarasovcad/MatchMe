import React from "react";
import ProfileMiniCard from "../profiles/ProfileMiniCard";
import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";
import FollowUserButton from "@/components/follows/FollowUserButton";
import ProfileMiniCardSkeleton from "../profiles/ProfileMiniCardSkeleton";

const ProjectTeamMembers = ({
  members,
  userSessionId,
  isLoading,
  searchQuery,
}: {
  members: ProjectTeamMemberMinimal[];
  userSessionId?: string;
  isLoading?: boolean;
  searchQuery?: string;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length: 3}).map((_, index) => (
          <ProfileMiniCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (members.length === 0 && searchQuery) {
    return (
      <div className="@container w-full">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="text-foreground/80 mb-2.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-[16px] font-medium text-foreground mb-1.5">No team members found</h3>
          <p className="text-muted-foreground text-[13px] max-w-md leading-relaxed">
            No team members match your search for &quot;{searchQuery}&quot;. Try a different search
            term or browse all members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <ProfileMiniCard key={member.user_id} member={member} userSessionId={userSessionId} />
      ))}
    </div>
  );
};

export default ProjectTeamMembers;
