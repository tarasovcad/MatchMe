"use client";

import React, {useMemo} from "react";
import {Lightbulb} from "lucide-react";
import {QuickActionSection} from "./shared";

interface QuickActionsGridProps {
  sections: QuickActionSection[];
  onSelect: (sectionId: string) => void;
}

const QuickActionsGrid = ({sections, onSelect}: QuickActionsGridProps) => {
  const gridSections = useMemo(
    () => sections.filter((s) => ["profiles", "projects", "notifications", "inbox"].includes(s.id)),
    [sections],
  );

  return (
    <div className="px-3 py-6">
      <div className="text-center pb-4 flex flex-col items-center gap-1">
        <Lightbulb size={20} className="text-foreground/80 shrink-0" strokeWidth={2} />
        <div className="text-[15px] font-medium text-foreground">What are you looking for?</div>
        <div className="text-xs text-muted-foreground">
          Pick a category below to start exploring
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-fit mx-auto">
        {gridSections.map(({id, title, icon: Icon}) => (
          <button
            key={`quick-${id}`}
            onClick={() => onSelect(id)}
            className="cursor-pointer py-2 px-12 rounded-lg border border-input bg-background/50 hover:bg-muted/70 transition-all duration-150 ease-in-out flex flex-col items-center justify-center gap-2 text-foreground">
            <Icon size={16} className="text-foreground/80" strokeWidth={2} />
            <span className="text-sm font-medium text-foreground/90">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
