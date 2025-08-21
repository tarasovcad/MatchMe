"use client";

import React from "react";

const SearchFooter = () => {
  return (
    <div className="sticky bottom-0 z-[100] bg-background border-t border-border px-3 py-2.5">
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-4 w-4 select-none items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground">
            ↑
          </kbd>
          <kbd className="pointer-events-none inline-flex h-4 w-4 select-none items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground">
            ↓
          </kbd>
          <span>To navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-4 w-4 select-none items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground">
            ↵
          </kbd>
          <span>To select</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            esc
          </kbd>
          <span>To close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchFooter;
