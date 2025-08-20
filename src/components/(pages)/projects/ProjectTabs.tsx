"use client";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import ProjectOpenPositions from "./ProjectOpenPositions";
import ProjectTeamMembers from "./ProjectTeamMembers";
import {useProjectTeamMembersMinimal} from "@/hooks/query/projects/use-project-team-members-minimal";
import {useProjectOpenPositionsMinimal} from "@/hooks/query/projects/use-project-open-positions-minimal";

export default function ProjectTabs({
  projectId,
  userSessionId,
}: {
  projectId: string;
  userSessionId?: string;
}) {
  // Prefetch minimal team members with follow relationships; not used in UI yet
  const {data: members, isLoading: isTeamMembersLoading} = useProjectTeamMembersMinimal(
    projectId,
    userSessionId,
  );
  const {data: openPositions, isLoading: isOpenPositionsLoading} = useProjectOpenPositionsMinimal(
    projectId,
    userSessionId,
  );

  function checkLength(length: number | undefined) {
    if (length === 0) {
      return undefined;
    }
    return length;
  }

  const tabs: Tab[] = [
    {value: "open-positions", label: "Open Positions", count: checkLength(openPositions?.length)},
    {value: "team-members", label: "Team Members", count: checkLength(members?.length)},
    {value: "posts", label: "Posts", disabled: true},
  ];

  const handleSearch = (value: string) => {
    console.log("Search:", value);
    // TODO: Implement search functionality
  };
  const handleFilter = () => {
    console.log("Filter clicked");
    // TODO: Implement filter functionality
  };

  const renderTabContent = (activeTab: string) => {
    switch (activeTab) {
      case "open-positions":
        return (
          <ProjectOpenPositions
            projectId={projectId}
            userSessionId={userSessionId}
            isLoading={isOpenPositionsLoading}
            openPositions={openPositions ?? []}
          />
        );
      case "team-members":
        return (
          <ProjectTeamMembers
            members={members ?? []}
            userSessionId={userSessionId}
            isLoading={isTeamMembersLoading}
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
            openPositions={openPositions ?? []}
          />
        );
    }
  };

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="open-positions"
      searchPlaceholder="Search"
      onSearch={handleSearch}
      onFilter={handleFilter}
      topPadding={true}
      disableSearch={(activeTab) => activeTab === "team-members"}
      disableFilter={(activeTab) => activeTab === "team-members"}>
      {renderTabContent}
    </FilterableTabs>
  );
}
