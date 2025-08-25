"use client";
import React from "react";

import {dashboardTabsData} from "@/data/tabs/dashboardTabs";
import AnalyticsTab from "./tabs/AnalyticsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import TabNavigation from "@/components/ui/form/TabNavigation";
import DashboardHeader from "./header/DashboardHeader";
import {User} from "@supabase/supabase-js";
import OverviewTab from "./tabs/OverviewTab";
import UserFollowsTab from "./tabs/UserFollowsTab";
import SavedTab from "./tabs/SavedTab";
import RequestsTab from "./tabs/RequestsTab";

const DashboardClientPage = ({tab, user}: {tab: string | string[]; user: User}) => {
  const renderSelectedComponent = () => {
    switch (tab) {
      case "overview":
        return <OverviewTab user={user} />;
      case "analytics":
        return <AnalyticsTab user={user} />;
      case "projects":
        return <ProjectsTab user={user} />;
      case "requests":
        return <RequestsTab user={user} />;
      case "follows":
        return <UserFollowsTab user={user} />;
      case "saved":
        return <SavedTab user={user} />;
      default:
        return <AnalyticsTab user={user} />;
    }
  };

  return (
    <div className="@container flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-6">
        <DashboardHeader
          title="Dashboard Overview"
          subtitle="Track your followers, posts, and projects all in one place"
          currentTab={tab as string}
        />
        <TabNavigation tabsData={dashboardTabsData} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default DashboardClientPage;
