"use client";

import * as React from "react";
import {
  Bell,
  FolderOpen,
  Globe,
  HelpCircle,
  MessageCircle,
  PanelsTopLeft,
  Settings,
  Users,
} from "lucide-react";

import {NavMain} from "@/components/ui/nav-main";
import {NavUser} from "@/components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/shadcn/sidebar";
import {LogoImage, LogoText} from "./Logo";
import OpenSearchModal from "../search/OpenSearchModal";
import type {User} from "@supabase/supabase-js";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {user?: User}) {
  const data = {
    user: {
      name: user.user_metadata.name,
      email: user.user_metadata.email,
      avatar: user.user_metadata.image,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: PanelsTopLeft,
        isActive: true,
      },
      {
        title: "Feed",
        url: "/feed",
        icon: Globe,
        isActive: true,
      },
      {
        title: "Projects",
        url: "/projects",
        icon: FolderOpen,
        isActive: true,
      },
      {
        title: "Profiles",
        url: "/profiles",
        icon: Users,
        isActive: true,
      },
      {
        title: "Inbox",
        url: "/inbox",
        icon: MessageCircle,
        isActive: true,
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        isActive: true,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        isActive: true,
      },
      {
        title: "Support",
        url: "/support",
        icon: HelpCircle,
        isActive: true,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <div className="py-3 px-[6px] flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <LogoImage size={24} />
            <LogoText className="transition-opacity duration-300 ease-in-out group-data-[state=collapsed]:hidden" />
          </div>
          <div className="transition-opacity duration-300 ease-in-out group-data-[state=collapsed]:hidden">
            {/* <SidebarTrigger /> */}
            {/* smth here on the right side from logo*/}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <OpenSearchModal />
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavMain items={data.navSecondary} />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
