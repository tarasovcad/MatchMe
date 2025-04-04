"use client";
import React, {useRef, useState} from "react";
import {SidebarMenuButton} from "../shadcn/sidebar";
import {cn} from "@/lib/utils";
import {CheckCheck, LucideIcon, Maximize2, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "../shadcn/popover";
import {Button} from "../shadcn/button";
import {motion} from "framer-motion";
import Image from "next/image";

const groupsNames = [
  {
    title: "All",
    id: "all",
    number: 4,
  },
  {
    title: "Mentions",
    id: "mentions",
    number: 3,
  },
  {
    title: "Direct Messages",
    id: "direct-messages",
    number: 2,
  },
  {
    title: "Project Updates",
    id: "project-updates",
    number: 1,
  },
];

const NotificationsPopover = ({
  item,
}: {
  item: {title: string; url: string; icon?: LucideIcon; isActive?: boolean};
}) => {
  const [activeTab, setActiveTab] = useState(groupsNames[0]?.id);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
                      <div className="flex justify-center items-center border border-border rounded-[6px] w-5 h-5 text-xs">
                        4
                      </div>
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
          <div className="flex-grow mt-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
            <div className="flex flex-col">
              {/* item one */}
              <button className="flex items-start gap-2 hover:bg-muted p-1.5 py-2.5 rounded-radius">
                {/* image */}
                <div className="relative w-10 h-10">
                  <Image
                    src={
                      "https://d32crm5i3cn4pm.cloudfront.net/user-avatars/3348d7ca-5bde-4b33-8415-4395c3fe847a/image.jpg"
                    }
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
                  <div className="flex justify-between items-start gap-2">
                    <p>
                      <span className="font-medium text-foreground">
                        Alice Smith
                      </span>{" "}
                      started following you
                    </p>
                    <div className="bg-primary rounded-full w-2 h-2"></div>
                  </div>
                  {/* date and time */}
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <p>Monday, 19:30</p>
                    <p>2 hours ago</p>
                  </div>
                </div>
              </button>
              <button className="flex items-start gap-2 hover:bg-muted p-1.5 py-2.5 rounded-radius">
                {/* image */}
                <div className="relative w-10 h-10">
                  <Image
                    src={
                      "https://d32crm5i3cn4pm.cloudfront.net/user-avatars/3348d7ca-5bde-4b33-8415-4395c3fe847a/image.jpg"
                    }
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
                      <span className="font-medium text-foreground">
                        Maria Josh
                      </span>{" "}
                      liked your post{" "}
                      <span className="font-medium text-foreground">
                        How to start a successful start-up
                      </span>
                    </p>
                    <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>
                  </div>
                  {/* date and time */}
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <p>Monday, 20:03</p>
                    <p>4 hours ago</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
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

export default NotificationsPopover;
