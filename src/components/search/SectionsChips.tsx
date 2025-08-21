"use client";

import React from "react";
import {cn} from "@/lib/utils";
import {QuickActionSection} from "./shared";

interface SectionsChipsProps {
  sections: QuickActionSection[];
  selectedSection: string | null;
  onClick: (sectionId: string) => void;
}

const SectionsChips = ({sections, selectedSection, onClick}: SectionsChipsProps) => {
  return (
    <div className="p-3 py-2.5 flex items-center gap-2 flex-wrap">
      {sections.map(({id, title, icon: Icon}) => (
        <button
          key={id}
          onClick={() => onClick(id)}
          className={cn(
            "h-7 gap-[3px] w-fit px-2 relative border border-input rounded-[6px] font-medium text-[13px] flex items-center text-foreground ring/50 cursor-pointer hover:bg-muted transition-all duration-150 ease-in-out",
            selectedSection === id && "bg-muted",
          )}>
          <Icon size={16} className="text-foreground/75 shrink-0" strokeWidth={2} />
          {title}
        </button>
      ))}
    </div>
  );
};

export default SectionsChips;
