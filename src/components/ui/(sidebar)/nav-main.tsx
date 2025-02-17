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
                <div className="w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium absolute right-2 top-1/2 -translate-y-1/2 group-data-[state=collapsed]:hidden">
                  2
                </div>
              )}
              <CollapsibleTrigger asChild>
                <Link href={item.url}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.title === "Notifications" && (
                      <div className="w-[6px] h-[6px] bg-primary rounded-full absolute top-[17px] left-[17px] outline outline-[1.8px] outline-sidebar-background"></div>
                    )}

                    {item.icon && <item.icon className="stroke-[2.1px]" />}
                    {/* <MainGradient as="span">{item.title}</MainGradient> */}
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
