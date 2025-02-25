import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import SidebarProvider from "@/providers/SidebarProvider";
import React from "react";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="p-10 bg-red-500">
        <SettingsTabs tab="account" />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure
          provident
        </p>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
