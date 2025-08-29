import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
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
import {useUnreadNotificationsCount} from "@/hooks/query/use-unread-notifications-count";
import {useNotificationGroupCounts} from "@/hooks/query/use-notification-group-counts";
import {groupFollowNotificationsTiered} from "@/utils/other/dateGrouping";

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

const NOTIFICATION_TABLE = "notifications";

const NotificationsPopover = ({
  item,
  userSessionId,
}: {
  item: {title: string; url: string; icon?: LucideIcon; isActive?: boolean};
  userSessionId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [hasLoaded, setHasLoaded] = useState(false);
  const realtimeSubscriptionRef = useRef<{unsubscribe: () => void} | null>(null);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {data: unreadCount = 0} = useUnreadNotificationsCount(userSessionId);
  const {data: groupedCounts} = useNotificationGroupCounts(userSessionId, open);
  const {
    items: notifications = [],
    isLoadingInitial: isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useInfiniteNotifications(userSessionId, open, {firstPageSize: 50, pageSize: 20});

  const displayGroups = useMemo(() => {
    if (groupedCounts) {
      return NOTIFICATION_GROUPS.map((g) => ({...g, number: groupedCounts[g.id] ?? 0}));
    }
    const unread = notifications.filter((n) => !n.is_read);
    const counts: {[key: string]: number} = {all: unread.length};
    NOTIFICATION_GROUPS.slice(1).forEach((g) => {
      counts[g.id] = unread.filter(
        (n) => getNotificationTypeGroup(n.type as string) === g.id,
      ).length;
    });
    return NOTIFICATION_GROUPS.map((g) => ({...g, number: counts[g.id] || 0}));
  }, [groupedCounts, notifications]);

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

            const profileKey = ["profile", newNotification.sender_id] as const;
            const senderData = (await queryClient.fetchQuery({
              queryKey: profileKey,
              queryFn: async () => {
                const {data, error} = await supabase
                  .from("profiles")
                  .select("id, username, name, profile_image")
                  .eq("id", newNotification.sender_id)
                  .single();
                if (error) throw error;
                return data as Notification["sender"];
              },
              staleTime: 5 * 60 * 1000,
            })) as Notification["sender"];

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

            if (newNotification.reference_id) {
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

            // Immediate regroup on the first page for smoother UX
            queryClient.setQueriesData<InfiniteData<NotificationsInfinitePage>>(
              {queryKey: ["notifications", userSessionId, "infinite"]},
              (prev) => {
                if (!prev) return prev;
                const firstPage = prev.pages?.[0];
                if (!firstPage) return prev;

                const exists = firstPage.items?.some((n) => n.id === formattedNotification.id);
                if (exists) return prev;

                // Expand any existing grouped follow items back into single follow items
                const ungroupedFirstPageItems: Notification[] = (firstPage.items || []).flatMap(
                  (n) => {
                    if (
                      n.type === "follow_grouped" &&
                      Array.isArray(n.grouped_ids) &&
                      Array.isArray(n.grouped_senders) &&
                      n.grouped_ids.length > 0
                    ) {
                      return n.grouped_ids.map((gid, idx) => ({
                        id: gid,
                        type: "follow",
                        created_at: n.created_at,
                        sender_id: n.grouped_senders?.[idx]?.id || n.sender_id,
                        recipient_id: n.recipient_id,
                        reference_id: null,
                        is_read: n.is_read,
                        status: n.status,
                        action_taken_at: n.action_taken_at,
                        sender: n.grouped_senders?.[idx] || n.sender,
                      })) as Notification[];
                    }
                    return [n];
                  },
                );

                const combined = [formattedNotification, ...ungroupedFirstPageItems];
                const regrouped = groupFollowNotificationsTiered(combined) as Notification[];

                const updatedFirstPage = {
                  ...firstPage,
                  items: regrouped,
                };

                return {
                  ...prev,
                  pages: [updatedFirstPage, ...prev.pages.slice(1)],
                  pageParams: prev.pageParams,
                };
              },
            );

            // Refetch from source so grouping is recomputed from raw rows as well
            await queryClient.invalidateQueries({
              queryKey: ["notifications", userSessionId, "infinite"],
            });
            await queryClient.refetchQueries({
              queryKey: ["notifications", userSessionId, "infinite"],
            });

            // Refresh counts queries so tabs and badge stay accurate
            queryClient.invalidateQueries({
              queryKey: ["notifications", userSessionId, "unread-count"],
            });
            queryClient.invalidateQueries({
              queryKey: ["notifications", userSessionId, "grouped-unread-counts"],
            });

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
            const updated = payload.new as RawNotificationRow;

            queryClient.setQueriesData<InfiniteData<NotificationsInfinitePage>>(
              {queryKey: ["notifications", userSessionId, "infinite"]},
              (prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  pages: prev.pages.map((pg) => ({
                    ...pg,
                    items: (pg.items || []).map((n: Notification) => {
                      // If this page item is a grouped follow and contains the updated id, only toggle is_read
                      if (
                        n.type === "follow_grouped" &&
                        (n.id === updated.id || (n.grouped_ids || []).includes(updated.id))
                      ) {
                        return {...n, is_read: updated.is_read};
                      }
                      // For single items, match by id and update is_read (and status if present)
                      if (n.id === updated.id) {
                        const next: Notification = {
                          ...n,
                          is_read: updated.is_read,
                        } as Notification;
                        if (typeof updated.status !== "undefined") {
                          next.status = updated.status as Notification["status"];
                        }
                        if (typeof updated.action_taken_at !== "undefined") {
                          next.action_taken_at = updated.action_taken_at || null;
                        }
                        return next;
                      }
                      return n;
                    }),
                  })),
                  pageParams: prev.pageParams,
                };
              },
            );
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.log("Realtime channel error for notifications");
          } else if (status === "TIMED_OUT") {
            console.warn("Realtime channel timeout for notifications");
          }
        });

      realtimeSubscriptionRef.current = subscription;
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [userSessionId, queryClient, open]);

  useEffect(() => {
    if (!userSessionId) return;

    if (open && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [open, hasLoaded, userSessionId]);

  // Seed sender profiles into TanStack cache to avoid refetching on realtime
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const uniqueSenders = new Map<string, Notification["sender"]>();

    for (const n of notifications) {
      if (n.sender) {
        uniqueSenders.set(n.sender.id, n.sender);
      }
      if (n.grouped_senders && n.grouped_senders.length > 0) {
        for (const s of n.grouped_senders) {
          uniqueSenders.set(s.id, s);
        }
      }
    }

    uniqueSenders.forEach((sender, id) => {
      queryClient.setQueryData(["profile", id], sender);
    });
  }, [notifications, queryClient]);

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
          {unreadCount > 0 && (
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
              groups={displayGroups}
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
              markAsRead={(ids) => markAsRead(ids)}
              currentUserId={userSessionId}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-2 bg-background border-t border-border p-3 rounded-b-[12px] ">
            <Button
              variant={"outline"}
              size={"xs"}
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}>
              <CheckCheck size="16" />
              Mark all as read
            </Button>
            <Button variant={"secondary"} size={"xs"} disabled>
              View all
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
