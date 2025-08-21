"use client";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import ProjectOpenPositions from "./ProjectOpenPositions";
import ProjectTeamMembers from "./ProjectTeamMembers";
import {useProjectTeamMembersMinimal} from "@/hooks/query/projects/use-project-team-members-minimal";
import {useProjectOpenPositionsMinimal} from "@/hooks/query/projects/use-project-open-positions-minimal";
import {useState, useMemo} from "react";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";

export default function ProjectTabs({
  projectId,
  userSessionId,
}: {
  projectId: string;
  userSessionId?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Prefetch minimal team members with follow relationships; not used in UI yet
  const {data: members, isLoading: isTeamMembersLoading} = useProjectTeamMembersMinimal(
    projectId,
    userSessionId,
  );
  const {data: openPositions, isLoading: isOpenPositionsLoading} = useProjectOpenPositionsMinimal(
    projectId,
    userSessionId,
  );

  // Determine viewer's membership/ownership in this project
  const {isOwner, isTeamMember} = useMemo(() => {
    const viewer = members?.find((m) => m.user_id === userSessionId);
    return {
      isOwner: Boolean(viewer?.is_owner),
      isTeamMember: Boolean(viewer),
    };
  }, [members, userSessionId]);

  // Search filter functions
  const filterOpenPositions = (
    positions: ProjectOpenPosition[],
    query: string,
  ): ProjectOpenPosition[] => {
    if (!query.trim()) return positions;

    const lowercaseQuery = query.toLowerCase();
    return positions.filter((position) => {
      const titleMatch = position.title?.toLowerCase().includes(lowercaseQuery);
      const descriptionMatch = position.description?.toLowerCase().includes(lowercaseQuery);
      const requirementsMatch = position.requirements?.toLowerCase().includes(lowercaseQuery);
      const postedByNameMatch = position.posted_by_name?.toLowerCase().includes(lowercaseQuery);
      const postedByUsernameMatch = position.posted_by_username
        ?.toLowerCase()
        .includes(lowercaseQuery);

      // Search in required skills
      const skillsMatch = position.required_skills?.some((skill) =>
        skill.toLowerCase().includes(lowercaseQuery),
      );

      // Search in required skills with images
      const skillsWithImagesMatch = position.required_skills_with_images?.some((skill) =>
        skill.name.toLowerCase().includes(lowercaseQuery),
      );

      return (
        titleMatch ||
        descriptionMatch ||
        requirementsMatch ||
        postedByNameMatch ||
        postedByUsernameMatch ||
        skillsMatch ||
        skillsWithImagesMatch
      );
    });
  };

  const filterTeamMembers = (
    members: ProjectTeamMemberMinimal[],
    query: string,
  ): ProjectTeamMemberMinimal[] => {
    if (!query.trim()) return members;

    const lowercaseQuery = query.toLowerCase();
    return members.filter((member) => {
      const nameMatch = member.name?.toLowerCase().includes(lowercaseQuery);
      const usernameMatch = member.username?.toLowerCase().includes(lowercaseQuery);
      const displayNameMatch = member.display_name?.toLowerCase().includes(lowercaseQuery);

      return nameMatch || usernameMatch || displayNameMatch;
    });
  };

  // Apply search filters
  const filteredOpenPositions = useMemo(() => {
    return filterOpenPositions(openPositions ?? [], searchQuery);
  }, [openPositions, searchQuery]);

  const filteredTeamMembers = useMemo(() => {
    return filterTeamMembers(members ?? [], searchQuery);
  }, [members, searchQuery]);

  function checkLength(length: number | undefined) {
    if (length === 0) {
      return undefined;
    }
    return length;
  }

  const tabs: Tab[] = [
    {
      value: "open-positions",
      label: "Open Positions",
      count: checkLength(filteredOpenPositions?.length),
    },
    {value: "team-members", label: "Team Members", count: checkLength(filteredTeamMembers?.length)},
    {value: "posts", label: "Posts", disabled: true},
  ];

  const renderTabContent = (activeTab: string) => {
    switch (activeTab) {
      case "open-positions":
        return (
          <ProjectOpenPositions
            projectId={projectId}
            userSessionId={userSessionId}
            isLoading={isOpenPositionsLoading}
            openPositions={filteredOpenPositions}
            searchQuery={searchQuery}
            isOwner={isOwner}
            isTeamMember={isTeamMember}
          />
        );
      case "team-members":
        return (
          <ProjectTeamMembers
            members={filteredTeamMembers}
            userSessionId={userSessionId}
            isLoading={isTeamMembersLoading}
            searchQuery={searchQuery}
          />
        );
      case "posts":
        return <p className="text-muted-foreground p-4 text-center text-xs">Content for Posts</p>;
      default:
        return (
          <ProjectOpenPositions
            projectId={projectId}
            userSessionId={userSessionId}
            isLoading={isOpenPositionsLoading}
            openPositions={filteredOpenPositions}
            searchQuery={searchQuery}
            isOwner={isOwner}
            isTeamMember={isTeamMember}
          />
        );
    }
  };

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="open-positions"
      searchPlaceholder="Search..."
      onSearch={(value) => setSearchQuery(value)}
      topPadding={true}>
      {renderTabContent}
    </FilterableTabs>
  );
}
