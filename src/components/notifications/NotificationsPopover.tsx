import React, {useCallback, useEffect, useRef, useState} from "react";
import {SidebarMenuButton} from "../shadcn/sidebar";
import {cn} from "@/lib/utils";
import {CheckCheck, LucideIcon, Maximize2, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "../shadcn/popover";
import {Button} from "../shadcn/button";
import {Notification} from "@/types/notifications";
import {supabase} from "@/utils/supabase/client";
import {toast} from "sonner";
import NotificationTabs from "./NotificationTabs";
import NotificationList from "./NotificationList";
import {getNotificationTypeGroup, NOTIFICATION_GROUPS} from "@/data/tabs/notificationsTabs";
import {useInfiniteNotifications} from "@/hooks/query/use-notifications";
import {useQueryClient, type InfiniteData} from "@tanstack/react-query";

type RawNotificationRow = {
  id: string;
  type: Notification["type"];
  created_at: string;
  sender_id: string;
  recipient_id: string;
  reference_id?: string | null;
  is_read: boolean;
  status?: Notification["status"];
  action_taken_at?: string | null;
};

type NotificationsInfinitePage = {items: Notification[]; nextPage?: number};

const NOTIFICATION_TABLE = "mock_notifications";

const NotificationsPopover = ({
  item,
  userSessionId,
}: {
  item: {title: string; url: string; icon?: LucideIcon; isActive?: boolean};
  userSessionId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [groupsNames, setGroupsNames] = useState(
    NOTIFICATION_GROUPS.map((group) => ({...group, number: 0})),
  );
  const [activeTab, setActiveTab] = useState("all");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const realtimeSubscriptionRef = useRef<{unsubscribe: () => void} | null>(null);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const notifications = [];

  const {
    // items: notifications = [],
    isLoadingInitial: isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useInfiniteNotifications(userSessionId, open, {firstPageSize: 50, pageSize: 20});

  const updateNotificationCounts = (notifications: Notification[]) => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    // Initialize counts
    const counts: {[key: string]: number} = {all: unreadNotifications.length};

    // Count by type
    NOTIFICATION_GROUPS.slice(1).forEach((group) => {
      counts[group.id] = unreadNotifications.filter(
        (n) => getNotificationTypeGroup(n.type as string) === group.id,
      ).length;
    });

    // Compute new groups array
    const newGroups = NOTIFICATION_GROUPS.map((group) => ({
      ...group,
      number: counts[group.id] || 0,
    }));

    // Only update state if something actually changed (shallow compare numbers)
    const changed = newGroups.some((g, idx) => g.number !== groupsNames[idx]?.number);
    if (changed) {
      setGroupsNames(newGroups);
    }
  };

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userSessionId) return;

    const setupRealtimeSubscription = async () => {
      // Clean up any existing subscription
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }

      // Subscribe to INSERT operations on the notifications table for this user
      const subscription = supabase
        .channel(`${NOTIFICATION_TABLE}:${userSessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: NOTIFICATION_TABLE,
            filter: `recipient_id=eq.${userSessionId}`,
          },
          async (payload) => {
            // When a new notification is inserted
            const newNotification = payload.new as RawNotificationRow;

            // Fetch the sender details
            const {data: senderData, error: senderError} = await supabase
              .from("profiles")
              .select("id, username, name, profile_image")
              .eq("id", newNotification.sender_id)
              .single();

            if (senderError) {
              console.error("Error fetching sender details:", senderError);
              return;
            }

            let formattedNotification: Notification = {
              id: newNotification.id,
              type: newNotification.type,
              created_at: newNotification.created_at,
              sender_id: newNotification.sender_id,
              recipient_id: newNotification.recipient_id,
              reference_id: newNotification.reference_id,
              is_read: newNotification.is_read,
              status: (newNotification.status || "pending") as Notification["status"],
              action_taken_at: newNotification.action_taken_at,
              sender: senderData,
            };

            if (newNotification.type === "project_invite" && newNotification.reference_id) {
              try {
                const {data: projectData} = await supabase
                  .from("projects")
                  .select("id, name, slug")
                  .eq("id", newNotification.reference_id)
                  .single();
                if (projectData) {
                  formattedNotification = {
                    ...formattedNotification,
                    project: projectData,
                  };
                }
              } catch (projectError) {
                console.error("Error fetching project details for realtime:", projectError);
              }
            }

            // Update infinite cache by prepending to first page
            queryClient.setQueryData<InfiniteData<NotificationsInfinitePage>>(
              ["notifications", userSessionId, "infinite"],
              (prev) => {
                if (!prev) return prev;
                const firstPage = prev.pages?.[0];
                return {
                  ...prev,
                  pages: [
                    {
                      items: [formattedNotification, ...(firstPage?.items || [])],
                      nextPage: firstPage?.nextPage,
                    },
                    ...prev.pages.slice(1),
                  ],
                  pageParams: prev.pageParams,
                };
              },
            );
            setHasNewNotification(true);

            // Update notification counts from latest cache
            const latestInfinite = queryClient.getQueryData<
              InfiniteData<NotificationsInfinitePage>
            >(["notifications", userSessionId, "infinite"]);
            const latestItems: Notification[] = latestInfinite
              ? latestInfinite.pages.flatMap((p) => p.items)
              : [];
            updateNotificationCounts(latestItems);

            // Show a toast notification
            toast.info(`New notification from ${senderData.name}`);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: NOTIFICATION_TABLE,
            filter: `recipient_id=eq.${userSessionId}`,
          },
          (payload) => {
            // When a notification is updated (e.g., marked as read)
            const updatedNotification = payload.new as Notification;

            queryClient.setQueryData<InfiniteData<NotificationsInfinitePage>>(
              ["notifications", userSessionId, "infinite"],
              (prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  pages: prev.pages.map((pg) => ({
                    ...pg,
                    items: (pg.items || []).map((n: Notification) =>
                      n.id === updatedNotification.id ? {...n, ...updatedNotification} : n,
                    ),
                  })),
                  pageParams: prev.pageParams,
                };
              },
            );

            // Update notification counts
            const latestInfinite = queryClient.getQueryData<
              InfiniteData<NotificationsInfinitePage>
            >(["notifications", userSessionId, "infinite"]);
            const latestItems: Notification[] = latestInfinite
              ? latestInfinite.pages.flatMap((p) => p.items)
              : [];
            updateNotificationCounts(latestItems);
          },
        )
        .subscribe();

      realtimeSubscriptionRef.current = subscription;
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [userSessionId, queryClient]);

  useEffect(() => {
    if (!userSessionId) return;

    if (open && !hasLoaded) {
      setHasLoaded(true);
    }

    if (open) {
      setHasNewNotification(false);
    }
  }, [open, hasLoaded, userSessionId]);

  // Recompute counts when query data changes
  useEffect(() => {
    updateNotificationCounts(notifications);
  }, [notifications]);

  const getFilteredNotifications = () => {
    if (activeTab === "all") {
      return notifications;
    }
    return notifications.filter(
      (notification) => getNotificationTypeGroup(notification.type as string) === activeTab,
    );
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoadingMore) return;
    const threshold = 120; // px from bottom
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Auto-load until the list becomes scrollable or there are no more pages
  useEffect(() => {
    const el = scrollRef.current;
    if (!open || !el) return;
    if (isLoading || isLoadingMore) return;
    if (!hasMore) return;
    if (el.scrollHeight <= el.clientHeight + 24) {
      loadMore();
    }
  }, [open, notifications.length, isLoading, isLoadingMore, hasMore, loadMore]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          className={cn(!item.isActive && "cursor-pointer")}
          tooltip={item.title}
          isActive={item.isActive}
          onClick={() => setOpen(true)}>
          {(groupsNames[0].number > 0 || hasNewNotification) && (
            <div className="top-[17px] left-[17px] absolute bg-primary rounded-full outline-[1.8px] outline-sidebar-background w-[6px] h-[6px]"></div>
          )}

          {item.icon && <item.icon className="stroke-[2.1px]" />}
          {item.title && <span>{item.title}</span>}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="relative bg-transparent shadow-none p-3 border-0 w-[442px] h-screen max-h-screen "
        sideOffset={8}>
        <div className="flex flex-col bg-background border border-border rounded-[12px] h-full">
          {/* Header */}
          <div>
            <div className="flex justify-between items-center gap-2 mb-3 p-4">
              <p className="font-medium text-[16px]">Notifications</p>
              <div className="flex gap-1">
                <Button size={"icon"} className="w-6 h-6" disabled>
                  <Maximize2 size={12} />
                </Button>

                <Button size={"icon"} className="w-6 h-6" onClick={() => setOpen(false)}>
                  <X size={12} />
                </Button>
              </div>
            </div>
            {/* Tabs */}
            <NotificationTabs
              groups={groupsNames}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          {/* Notification list */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-grow mt-3 max-h-[calc(100vh-190px)] overflow-y-auto scrollbar-thin ">
            <NotificationList
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              notifications={getFilteredNotifications()}
              markAsRead={() => {}}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-2 bg-background border-t border-border p-3 rounded-b-[12px] ">
            <Button variant={"outline"} size={"xs"}>
              <CheckCheck size="16" />
              Mark all as read
            </Button>
            <Button variant={"secondary"} size={"xs"}>
              View all
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
