import React from "react";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {useDragScroll} from "@/hooks/useDragScroll";

const NotificationTabs = ({
  groups,
  activeTab,
  onTabChange,
}: {
  groups: {title: string; id: string; number: number}[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) => {
  const {scrollRef, handleDragScroll} = useDragScroll();

  return (
    <div className="relative border-b border-border px-3">
      <div
        className="relative flex overflow-x-auto scrollbar-hide"
        ref={scrollRef}
        onMouseDown={handleDragScroll}>
        {groups.map((group) => {
          const isActive = group.id === activeTab;
          return (
            <button
              key={group.id}
              onClick={() => onTabChange(group.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2 text-secondary transition-colors font-medium text-[15px]",
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
  );
};

export default React.memo(NotificationTabs);
