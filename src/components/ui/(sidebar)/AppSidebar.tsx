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
import {NavMain} from "@/components/ui/(sidebar)/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/shadcn/sidebar";
import {LogoImage, LogoText} from "../Logo";
import OpenSearchModal from "../../search/OpenSearchModal";
import type {User} from "@supabase/supabase-js";
import Link from "next/link";
import {SidebarUserDropdown} from "./SidebarUserDropdown";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {user?: User}) {
  if (!user) return null;

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
        <div className="py-3 px-[6px] flex items-center justify-between ">
          <Link href={"/"} className="flex items-center gap-[6px] min-h-[29px]">
            <LogoImage size={24} />
            <LogoText className="transition-opacity duration-300 ease-in-out group-data-[state=collapsed]:hidden" />
          </Link>
          <div className="transition-opacity duration-300 ease-in-out group-data-[state=collapsed]:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <OpenSearchModal />
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavMain items={data.navSecondary} />
        <SidebarUserDropdown user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
