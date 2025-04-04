"use client";
import React, {useRef, useState} from "react";
import {SidebarMenuButton} from "../shadcn/sidebar";
import {cn} from "@/lib/utils";
import {LucideIcon, Maximize2, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "../shadcn/popover";
import {Button} from "../shadcn/button";
import {motion} from "framer-motion";

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
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          className={cn(!item.isActive && "cursor-pointer")}
          tooltip={item.title}
          isActive={item.isActive}>
          <div className="top-[17px] left-[17px] absolute bg-primary rounded-full outline-[1.8px] outline-sidebar-background w-[6px] h-[6px]"></div>

          {item.icon && <item.icon className="stroke-[2.1px]" />}
          {item.title && <span>{item.title}</span>}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="bg-transparent shadow-none p-3 border-0 w-[442px] h-screen max-h-screen"
        sideOffset={8}>
        <div className="bg-background p-3 border border-border rounded-[12px] h-full">
          <div className="">
            {/* text and buttons */}
            <div className="flex justify-between items-center gap-2 mb-3 p-1">
              <p className="font-medium text-[16px]">Notifications</p>
              <div className="flex gap-1">
                <Button size={"icon"} className="w-6 h-6">
                  <Maximize2 size={12} />
                </Button>

                <Button size={"icon"} className="w-6 h-6">
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
          <div className="mt-6">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aperiam
            culpa ea nobis consequatur voluptate soluta, accusantium vitae
            eveniet ut fugit eius eos hic nostrum voluptatibus minus dolore eum
            repellendus possimus.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
