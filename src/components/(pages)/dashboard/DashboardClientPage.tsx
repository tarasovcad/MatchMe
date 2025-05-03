"use client";
import React, {useState} from "react";

import {dashboardTabsData} from "@/data/tabs/dashboardTabs";
import OverviewTab from "./tabs/OverviewTab";
import ProjectsTab from "./tabs/ProjectsTab";
import TabNavigation from "@/components/ui/form/TabNavigation";
import DashboardHeader from "./header/DashboardHeader";

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
        <DashboardHeader />
        <TabNavigation tabsData={dashboardTabsData} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default DashboardClientPage;
