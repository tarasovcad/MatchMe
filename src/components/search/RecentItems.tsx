"use client";

import React, {useState} from "react";
import {CommandGroup, CommandItem} from "@/components/shadcn/command";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/shadcn/avatar";
import {getNameInitials} from "@/functions/getNameInitials";
import {cn} from "@/lib/utils";
import {X, RotateCcw} from "lucide-react";
import type {RecentItem} from "@/hooks/query/use-recent-items";
import {GROUP_HEADING_CLASSES, STICKY_HEADING_CLASSES, ITEM_BASE_CLASSES} from "./shared";

interface RecentItemsProps {
  items: RecentItem[];
  sectionType: string;
  onSelect: (item: RecentItem) => void;
  onDelete?: (item: RecentItem) => void;
}

const RecentItems = ({items, sectionType, onSelect, onDelete}: RecentItemsProps) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

  const handleDeleteClick = (e: React.MouseEvent, item: RecentItem) => {
    e.stopPropagation();
    onDelete?.(item);
  };

  return (
    <CommandGroup heading="Recent" className={cn(GROUP_HEADING_CLASSES, STICKY_HEADING_CLASSES)}>
      {items.map((item) => (
        <CommandItem
          key={item.id}
          className={cn(ITEM_BASE_CLASSES, "relative group")}
          value={`${sectionType}-recent-${item.id}`}
          onSelect={() => onSelect(item)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}>
          <div className="flex items-start gap-2 w-full">
            {item.type === "profile" ? (
              <>
                <Avatar className="h-7.5 w-7.5">
                  <AvatarImage
                    src={item.imageUrl ?? undefined}
                    alt={item.name || ""}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback>{getNameInitials(item.name || "")}</AvatarFallback>
                </Avatar>
                <div className="w-full text-secondary flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 text-start">
                    <span className="font-medium text-foreground text-sm">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">@{item.username}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="h-7.5 w-7.5 rounded-full border border-border  flex items-center justify-center">
                  <RotateCcw size={14} className="text-muted-foreground/60" />
                </div>
                <div className="w-full text-secondary flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 text-start">
                    <span className="font-medium text-foreground text-sm">{item.text}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center">
            {hoveredItemId === item.id && (
              <button
                onClick={(e) => handleDeleteClick(e, item)}
                className="cursor-pointer h-6 w-6 rounded-full flex items-center justify-center z-10"
                aria-label="Delete recent item">
                <X size={16} />
              </button>
            )}
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default RecentItems;
