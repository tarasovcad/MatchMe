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

const NotificationsPopover = ({
  item,
  userSessionId,
}: {
  item: {title: string; url: string; icon?: LucideIcon; isActive?: boolean};
  userSessionId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupsNames, setGroupsNames] = useState(
    NOTIFICATION_GROUPS.map((group) => ({...group, number: 0})),
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const realtimeSubscriptionRef = useRef<{unsubscribe: () => void} | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const {data, error} = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          created_at,
          sender_id,
          recipient_id,
          is_read,
          sender:profiles!notifications_sender_id_fkey (id, username, name, profileImage)
        `,
        )
        .eq("recipient_id", userSessionId)
        .order("created_at", {ascending: false});

      if (error) throw error;

      const formattedNotifications =
        data?.map((notification) => ({
          ...notification,
          sender: Array.isArray(notification.sender) ? notification.sender[0] : notification.sender,
        })) || [];

      setNotifications(formattedNotifications);
      updateNotificationCounts(formattedNotifications);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [userSessionId]);

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

    // Update groups with counts
    setGroupsNames(
      NOTIFICATION_GROUPS.map((group) => ({
        ...group,
        number: counts[group.id] || 0,
      })),
    );
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
        .channel(`notifications:${userSessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userSessionId}`,
          },
          async (payload) => {
            // When a new notification is inserted
            const newNotification = payload.new;

            // Fetch the sender details
            const {data: senderData, error: senderError} = await supabase
              .from("profiles")
              .select("id, username, name, image")
              .eq("id", newNotification.sender_id)
              .single();

            if (senderError) {
              console.error("Error fetching sender details:", senderError);
              return;
            }

            // Format the notification with sender details
            const formattedNotification = {
              id: newNotification.id,
              type: newNotification.type,
              created_at: newNotification.created_at,
              sender_id: newNotification.sender_id,
              recipient_id: newNotification.recipient_id,
              is_read: newNotification.is_read,
              sender: senderData,
            } as Notification;

            // Update the notifications state
            setNotifications((prev) => [formattedNotification, ...prev]);
            setHasNewNotification(true);

            // Update notification counts
            updateNotificationCounts([formattedNotification, ...notifications]);

            // Show a toast notification
            toast.info(`New notification from ${senderData.name}`);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userSessionId}`,
          },
          (payload) => {
            // When a notification is updated (e.g., marked as read)
            const updatedNotification = payload.new;

            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updatedNotification.id ? {...n, ...updatedNotification} : n,
              ),
            );

            // Update notification counts
            updateNotificationCounts(
              notifications.map((n) =>
                n.id === updatedNotification.id ? {...n, ...updatedNotification} : n,
              ),
            );
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
  }, [userSessionId, notifications]);

  useEffect(() => {
    if (!userSessionId) return;

    if (open && !hasLoaded) {
      fetchNotifications();
    }

    // Reset the new notification indicator when opening the popover
    if (open) {
      setHasNewNotification(false);
    }
  }, [open, fetchNotifications, hasLoaded]);

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || notification.is_read === true) {
      return;
    }

    try {
      const {error} = await supabase
        .from("notifications")
        .update({is_read: true})
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? {...n, is_read: true} : n,
      );

      setNotifications(updatedNotifications);
      updateNotificationCounts(updatedNotifications);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      if (unreadNotifications.length === 0) return;

      const {error} = await supabase
        .from("notifications")
        .update({is_read: true})
        .in(
          "id",
          unreadNotifications.map((n) => n.id),
        );

      if (error) throw error;

      // Update local state
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        is_read: true,
      }));
      setNotifications(updatedNotifications);
      updateNotificationCounts(updatedNotifications);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") {
      return notifications;
    }
    return notifications.filter(
      (notification) => getNotificationTypeGroup(notification.type as string) === activeTab,
    );
  };

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
        className="relative bg-transparent shadow-none p-3 border-0 w-[442px] h-screen max-h-screen"
        sideOffset={8}>
        <div className="flex flex-col bg-background p-3 border border-border rounded-[12px] h-full">
          {/* Header */}
          <div>
            <div className="flex justify-between items-center gap-2 mb-3 p-1">
              <p className="font-medium text-[16px]">Notifications</p>
              <div className="flex gap-1">
                <Button size={"icon"} className="w-6 h-6">
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
          <div className="flex-grow mt-2 max-h-[calc(100vh-190px)] overflow-y-auto scrollbar-thin">
            <NotificationList
              isLoading={isLoading}
              notifications={getFilteredNotifications()}
              markAsRead={markAsRead}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-2 bg-background pt-3 border-t border-border">
            <Button variant={"outline"} size={"xs"} onClick={markAllAsRead}>
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
