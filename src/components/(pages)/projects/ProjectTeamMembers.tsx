import React from "react";
import ProfileMiniCard from "../profiles/ProfileMiniCard";
import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";
import FollowUserButton from "@/components/follows/FollowUserButton";
import ProfileMiniCardSkeleton from "../profiles/ProfileMiniCardSkeleton";

const ProjectTeamMembers = ({
  members,
  userSessionId,
  isLoading,
}: {
  members: ProjectTeamMemberMinimal[];
  userSessionId?: string;
  isLoading?: boolean;
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <ProfileMiniCard key={member.user_id} member={member} userSessionId={userSessionId} />
      ))}
    </div>
  );
};

export default ProjectTeamMembers;
