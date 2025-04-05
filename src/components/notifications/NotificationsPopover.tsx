"use client";
import React, {useEffect, useRef, useState} from "react";
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
  const [groupsNames, setGroupsNames] = useState([
    {
      title: "All",
      id: "all",
      number: 0,
    },
    {
      title: "Follower Activity",
      id: "follower-activity",
      number: 0,
    },
    {
      title: "Mentions & Tags",
      id: "mentions-tags",
      number: 0,
    },
    {
      title: "Direct Messages",
      id: "direct-messages",
      number: 0,
    },
    {
      title: "Project Updates",
      id: "project-updates",
      number: 0,
    },
  ]);
  const fetchNotifications = async () => {
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
    console.log(data);
    if (error) console.error("Error fetching notifications:", error);
    else {
      const formattedNotifications =
        data?.map((notification) => ({
          ...notification,
          sender: Array.isArray(notification.sender)
            ? notification.sender[0]
            : notification.sender,
        })) || [];
      setNotifications(formattedNotifications);

      const unreadNotifications = formattedNotifications.filter(
        (n) => !n.is_read,
      );

      // Count notifications by type
      const notificationCounts: {[key: string]: number} = {
        all: unreadNotifications?.length || 0,
        "follower-activity":
          unreadNotifications?.filter((n) => n.type === "follow").length || 0,
        "mentions-tags":
          unreadNotifications?.filter(
            (n) => n.type === "mention" || n.type === "tag",
          ).length || 0,
        "direct-messages":
          unreadNotifications?.filter((n) => n.type === "message").length || 0,
        "project-updates":
          unreadNotifications?.filter((n) => n.type === "project").length || 0,
      };

      // Update groups with notification counts
      const updatedGroups = groupsNames.map((group) => ({
        ...group,
        number: notificationCounts[group.id] || 0,
      }));

      setGroupsNames(updatedGroups);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const [activeTab, setActiveTab] = useState(groupsNames[0]?.id);

  const markAsRead = async (notificationId: string) => {
    const {error} = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error.message);
      toast.error("Error marking notification as read");
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? {...n, is_read: true} : n)),
    );
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId ? {...n, is_read: true} : n,
    );

    const unreadNotifications = updatedNotifications.filter((n) => !n.is_read);

    const notificationCounts: {[key: string]: number} = {
      all: unreadNotifications.length,
      "follower-activity": unreadNotifications.filter(
        (n) => n.type === "follow",
      ).length,
      "mentions-tags": unreadNotifications.filter(
        (n) => n.type === "mention" || n.type === "tag",
      ).length,
      "direct-messages": unreadNotifications.filter((n) => n.type === "message")
        .length,
      "project-updates": unreadNotifications.filter((n) => n.type === "project")
        .length,
    };

    setGroupsNames(
      groupsNames.map((group) => ({
        ...group,
        number: notificationCounts[group.id] || 0,
      })),
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
          <div className="top-[17px] left-[17px] absolute bg-primary rounded-full outline-[1.8px] outline-sidebar-background w-[6px] h-[6px]"></div>

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
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <div className="flex-grow mt-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
              <div className="flex flex-col">
                {notifications.map((notification) => {
                  if (notification.type === "follow") {
                    return (
                      <FollowNotification
                        notification={notification}
                        key={notification.id}
                        markAsRead={markAsRead}
                      />
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* footer of the notifications */}
          <div className="flex justify-between items-center gap-2 bg-background pt-3 border-t border-border">
            <Button variant={"outline"} size={"xs"}>
              <CheckCheck size="16" />
              Mark as all read
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
