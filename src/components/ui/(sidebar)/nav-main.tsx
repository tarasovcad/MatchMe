"use client";

import {type LucideIcon} from "lucide-react";
import {Collapsible, CollapsibleTrigger} from "@/components/shadcn/collapsible";
import {SidebarGroup, SidebarMenu, SidebarMenuItem} from "@/components/shadcn/sidebar";
import {User} from "@supabase/supabase-js";
import {NavItemWithAuth} from "./NavItemWithAuth";

export function NavMain({
  items,
  user,
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
  user?: User | null;
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
                  5
                </div>
              )}
              <CollapsibleTrigger asChild>
                <NavItemWithAuth item={item} userSessionId={user?.id} />
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
