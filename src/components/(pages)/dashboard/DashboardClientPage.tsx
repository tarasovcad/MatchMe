"use client";
import React from "react";

import {dashboardTabsData} from "@/data/tabs/dashboardTabs";
import OverviewTab from "./tabs/OverviewTab";
import ProjectsTab from "./tabs/ProjectsTab";
import PageTitle from "@/components/pages/PageTitle";
import TabNavigation from "@/components/ui/form/TabNavigation";

const DashboardClientPage = ({tab}: {tab: string | string[]}) => {
  const renderSelectedComponent = () => {
    switch (tab) {
      case "overview":
        return <OverviewTab />;
      case "projects":
        return <ProjectsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Dashboard Overview"
          subtitle="Track your followers, posts, and projects all in one place"
        />
        <TabNavigation tabsData={dashboardTabsData} activeTab={tab} />
      </div>
      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default DashboardClientPage;
