"use client";

import {ChevronRight, type LucideIcon} from "lucide-react";

import {Collapsible, CollapsibleTrigger} from "@/components/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/sidebar";
import MainGradient from "../Text";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible">
            <SidebarMenuItem className="relative">
              {item.title === "Inbox" && (
                <div className="group-data-[state=collapsed]:hidden top-1/2 right-2 absolute flex justify-center items-center bg-primary rounded-full w-[18px] h-[18px] font-medium text-white text-xs -translate-y-1/2">
                  2
                </div>
              )}
              <CollapsibleTrigger asChild>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}>
                    {item.title === "Notifications" && (
                      <div className="top-[17px] left-[17px] absolute bg-primary rounded-full outline-[1.8px] outline-sidebar-background w-[6px] h-[6px]"></div>
                    )}

                    {item.icon && <item.icon className="stroke-[2.1px]" />}
                    {item.title && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
