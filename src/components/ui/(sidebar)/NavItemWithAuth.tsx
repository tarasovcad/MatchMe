"use client";
import Link from "next/link";
import {SidebarMenuButton} from "@/components/shadcn/sidebar";
import {LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import AuthGate from "@/components/other/AuthGate";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";

export function NavItemWithAuth({
  item,
  userSessionId,
  external,
}: {
  item: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    external?: boolean;
  };
  userSessionId?: string;
  external?: boolean;
}) {
  const isProtected = ["Inbox", "Settings", "Notifications", "Dashboard"].includes(item.title);
  const isNotifications = item.url === "/notifications";
  const isLoggedIn = !!userSessionId;

  if (isNotifications) {
    return (
      <AuthGate userSessionId={userSessionId}>
        <NotificationsPopover item={item} userSessionId={userSessionId || ""} />
      </AuthGate>
    );
  }

  const button = isLoggedIn ? (
    <Link href={item.url}>
      <SidebarMenuButton
        className={cn(!item.isActive && "cursor-pointer")}
        tooltip={item.title}
        isActive={item.isActive}>
        {item.icon && <item.icon className="stroke-[2.1px]" />}
        {item.title && <span>{item.title}</span>}
      </SidebarMenuButton>
    </Link>
  ) : (
    <SidebarMenuButton
      isActive={false}
      tooltip={item.title}
      className={cn(!item.isActive && "cursor-pointer")}>
      {item.icon && <item.icon className="stroke-[2.1px]" />}
      {item.title && <span>{item.title}</span>}
    </SidebarMenuButton>
  );

  return isProtected ? (
    <AuthGate userSessionId={userSessionId}>{button}</AuthGate>
  ) : (
    <Link href={item.url} target={external ? "_blank" : undefined}>
      <SidebarMenuButton
        className={cn(!item.isActive && "cursor-pointer")}
        tooltip={item.title}
        isActive={item.isActive}>
        {item.icon && <item.icon className="stroke-[2.1px]" />}
        {item.title && <span>{item.title}</span>}
      </SidebarMenuButton>
    </Link>
  );
}
