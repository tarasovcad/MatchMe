import React from "react";
import {Search} from "lucide-react";
import {cn} from "@/lib/utils";

const OpenSearchModal = () => {
  return (
    <>
      <div className="hidden group-data-[state=collapsed]:hidden md:block space-y-2 px-2 transition-opacity duration-300 ease-in-out">
        <div className="relative">
          <button
            className={cn(
              "transition-all duration-300 ease-in-out  peer pe-9 ps-9  h-[33.14px] font-medium flex w-full rounded-lg border border-input bg-sidebar px-3 py-[6px] text-sm text-muted-foreground/70  group-data-[state=collapsed]:pe-0 group-data-[state=collapsed]:ps-0 group-data-[state=collapsed]:border-0 cursor-pointer hover:border-ring/20 hover:bg-accent hover:text-accent-foreground/60",
            )}
            type="button">
            <span className="group-data-[state=collapsed]:hidden inline-flex">
              Search
            </span>
          </button>

          <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 group-data-[state=collapsed]:ps-2 text-muted-foreground/80 transition-all duration-100 ease-in-out pointer-events-none start-0">
            <Search size={16} strokeWidth={2} />
          </div>
          <div className="group-data-[state=collapsed]:hidden absolute inset-y-0 flex justify-center items-center pe-2 text-muted-foreground pointer-events-none end-0">
            <kbd className="inline-flex items-center px-1 border border-border rounded h-5 max-h-full font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenSearchModal;
