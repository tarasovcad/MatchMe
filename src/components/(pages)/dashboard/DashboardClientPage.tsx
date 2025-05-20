"use client";
import React from "react";

import {dashboardTabsData} from "@/data/tabs/dashboardTabs";
import OverviewTab from "./tabs/OverviewTab";
import ProjectsTab from "./tabs/ProjectsTab";
import TabNavigation from "@/components/ui/form/TabNavigation";
import DashboardHeader from "./header/DashboardHeader";
import {User} from "@supabase/supabase-js";

const DashboardClientPage = ({tab, user}: {tab: string | string[]; user: User}) => {
  const renderSelectedComponent = () => {
    switch (tab) {
      case "overview":
        return <OverviewTab user={user} />;
      case "projects":
        return <ProjectsTab />;
      default:
        return <OverviewTab user={user} />;
    }
  };

  return (
    <div className="@container flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-6">
        <DashboardHeader />
        <TabNavigation tabsData={dashboardTabsData} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default DashboardClientPage;
