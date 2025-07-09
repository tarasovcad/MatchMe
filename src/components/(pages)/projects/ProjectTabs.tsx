import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import ProjectOpenPositions from "./ProjectOpenPositions";
import ProjectTeamMembers from "./ProjectTeamMembers";

export default function ProjectTabs() {
  const tabs: Tab[] = [
    {value: "open-positions", label: "Open Positions", count: 12},
    {value: "team-members", label: "Team Members"},
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
        return <ProjectOpenPositions />;
      case "team-members":
        return <ProjectTeamMembers />;
      case "posts":
        return <p className="text-muted-foreground p-4 text-center text-xs">Content for Posts</p>;
      default:
        return <ProjectOpenPositions />;
    }
  };

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="team-members"
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
