"use client";

import React from "react";
import {motion, AnimatePresence} from "framer-motion";
import {CornerUpRight} from "lucide-react";
import {cn} from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shadcn/tooltip";

export type BulkAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  actions,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="bulk-actions-bar"
          layout
          initial={{opacity: 0, y: -8, height: 0}}
          animate={{opacity: 1, y: 0, height: "auto"}}
          exit={{opacity: 0, y: -8, height: 0}}
          transition={{type: "tween", ease: "easeOut", duration: 0.25}}
          className="sticky top-0 z-30 bg-background border-b border-border overflow-hidden">
          <TooltipProvider>
            <div className="flex items-center gap-5 text-muted-foreground text-sm px-2.5 py-2">
              {/* ── Clear selection ───────────────────────────── */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onClearSelection}
                      className="p-0.5 cursor-pointer transition-all duration-200 text-secondary hover:text-foreground/80">
                      <CornerUpRight className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="px-2 py-1">
                    <span className="text-secondary text-sm">Clear selection</span>
                  </TooltipContent>
                </Tooltip>
                <span className="select-none text-[13px] flex items-baseline gap-1">
                  {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected
                </span>
              </div>

              {/* ── Action buttons ───────────────────────────── */}
              <div className="flex items-center gap-2">
                {actions.map(({label, icon, onClick, className}) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onClick}
                        className={cn(
                          "p-0.5 cursor-pointer transition-all duration-200 text-secondary hover:text-foreground/80",
                          className,
                        )}>
                        {icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="px-2 py-1">
                      <span>{label}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionsBar;
