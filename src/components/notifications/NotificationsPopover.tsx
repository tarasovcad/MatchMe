import React, {useCallback, useEffect, useRef, useState} from "react";
import {SidebarMenuButton} from "../shadcn/sidebar";
import {cn} from "@/lib/utils";
import {CheckCheck, LucideIcon, Maximize2, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "../shadcn/popover";
import {Button} from "../shadcn/button";
import {motion} from "framer-motion";
import Image from "next/image";
import {Notification} from "@/types/notifications";
import {supabase} from "@/utils/supabase/client";
import Link from "next/link";
import {formatDateAbsolute, formatTimeRelative} from "@/functions/formatDate";
import {toast} from "sonner";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";

const NOTIFICATION_GROUPS = [
  {title: "All", id: "all"},
  {title: "Follower Activity", id: "follower-activity"},
  {title: "Mentions & Tags", id: "mentions-tags"},
  {title: "Direct Messages", id: "direct-messages"},
  {title: "Project Updates", id: "project-updates"},
];

const getNotificationTypeGroup = (type: string): string => {
  switch (type) {
    case "follow":
      return "follower-activity";
    case "mention":
    case "tag":
      return "mentions-tags";
    case "message":
      return "direct-messages";
    case "project":
      return "project-updates";
    default:
      return "all";
  }
};

const NotificationsPopover = ({
  item,
  userId,
}: {
  item: {title: string; url: string; icon?: LucideIcon; isActive?: boolean};
  userId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [groupsNames, setGroupsNames] = useState(
    NOTIFICATION_GROUPS.map((group) => ({...group, number: 0})),
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const realtimeSubscriptionRef = useRef<{unsubscribe: () => void} | null>(
    null,
  );

  console.log("NotificationsPopover executed");

  const fetchNotifications = useCallback(async () => {
    console.log("fetchNotifications started");
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
          sender:profiles!notifications_sender_id_fkey (id, username, name, image)
        `,
        )
        .eq("recipient_id", userId)
        .order("created_at", {ascending: false});

      if (error) throw error;

      const formattedNotifications =
        data?.map((notification) => ({
          ...notification,
          sender: Array.isArray(notification.sender)
            ? notification.sender[0]
            : notification.sender,
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
  }, [userId]);

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
    if (!userId) return;

    console.log("useEffect executed for Realtime subscription");
    const setupRealtimeSubscription = async () => {
      // Clean up any existing subscription
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }

      // Subscribe to INSERT operations on the notifications table for this user
      const subscription = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
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
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            // When a notification is updated (e.g., marked as read)
            const updatedNotification = payload.new;

            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updatedNotification.id
                  ? {...n, ...updatedNotification}
                  : n,
              ),
            );

            // Update notification counts
            updateNotificationCounts(
              notifications.map((n) =>
                n.id === updatedNotification.id
                  ? {...n, ...updatedNotification}
                  : n,
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
  }, [userId, notifications]);

  useEffect(() => {
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
      (notification) =>
        getNotificationTypeGroup(notification.type as string) === activeTab,
    );
  };

  const handleDragScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    const startX = e.pageX - scrollRef.current.offsetLeft;
    const scrollLeft = scrollRef.current.scrollLeft;

    const onMouseMove = (event: MouseEvent) => {
      if (!scrollRef.current) return;
      const walk = (event.pageX - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
          {/* header of the notifications */}
          <div>
            {/* text and buttons */}
            <div className="flex justify-between items-center gap-2 mb-3 p-1">
              <p className="font-medium text-[16px]">Notifications</p>
              <div className="flex gap-1">
                <Button size={"icon"} className="w-6 h-6">
                  <Maximize2 size={12} />
                </Button>

                <Button
                  size={"icon"}
                  className="w-6 h-6"
                  onClick={() => setOpen(false)}>
                  <X size={12} />
                </Button>
              </div>
            </div>
            {/* groups notifications */}
            <div className="relative border-b border-border">
              <div
                className="relative flex overflow-x-auto scrollbar-hide"
                ref={scrollRef}
                onMouseDown={handleDragScroll}>
                {groupsNames.map((group) => {
                  const isActive = group.id === activeTab;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveTab(group.id)}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-2 text-secondary transition-colors font-medium",
                        isActive && "text-foreground",
                        !isActive && "hover:text-foreground cursor-pointer",
                      )}>
                      <p className="whitespace-nowrap">{group.title}</p>
                      {group.number > 0 && (
                        <div className="flex justify-center items-center border border-border rounded-[6px] w-5 h-5 text-xs">
                          {group.number}
                        </div>
                      )}

                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="bottom-0 left-0 absolute bg-foreground w-full h-[2px]"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* body of the notifications */}
          {getFilteredNotifications().length === 0 && !isLoading ? (
            <div className="flex-grow mt-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
              <div className="flex flex-col justify-center items-center h-full">
                <p className="text-secondary">No notifications</p>
              </div>
            </div>
          ) : (
            <div className="flex-grow mt-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
              <div className="flex flex-col">
                {isLoading ? (
                  <LoadingButtonCircle />
                ) : (
                  <>
                    {getFilteredNotifications().map((notification) => {
                      if (notification.type === "follow") {
                        return (
                          <FollowNotification
                            notification={notification}
                            key={notification.id}
                            markAsRead={markAsRead}
                          />
                        );
                      }
                      // Add other notification types here as needed
                      return null;
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* footer of the notifications */}
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

const FollowNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (id: string) => void;
}) => {
  const {sender} = notification;
  const {image, name, username} = sender;
  return (
    <button
      className="flex items-start gap-2 hover:bg-muted p-1.5 py-2.5 rounded-radius"
      onClick={() => markAsRead(notification.id)}>
      {/* image */}
      <div className="relative w-10 h-10">
        <Image
          src={image}
          width={35}
          height={35}
          className="rounded-full"
          unoptimized
          alt="user"
        />
      </div>
      {/* content */}
      <div className="w-full text-secondary">
        {/* title with dot */}
        <div className="flex justify-between items-start gap-2 text-start">
          <p>
            <Link href={`/profiles/${username}`}>
              <span className="font-medium text-foreground hover:underline">
                {name}
              </span>
            </Link>{" "}
            started following you
          </p>
          {notification.is_read === false && (
            <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>
          )}
        </div>
        {/* date and time */}
        <div className="flex justify-between items-center gap-2 text-xs">
          <p>{formatDateAbsolute(notification.created_at)}</p>
          <p>{formatTimeRelative(notification.created_at)}</p>
        </div>
      </div>
    </button>
  );
};

export default NotificationsPopover;
