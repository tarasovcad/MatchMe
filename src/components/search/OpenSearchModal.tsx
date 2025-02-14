import React, {useId} from "react";
import {Label} from "../shadcn/label";
import {Search} from "lucide-react";
import {Input} from "../shadcn/input";
import {cn} from "@/lib/utils";

const OpenSearchModal = () => {
  return (
    <>
      <div className="space-y-2 px-2 transition-opacity duration-300 ease-in-out  group-data-[state=collapsed]:hidden ">
        <div className="relative">
          <button
            className={cn(
              "peer pe-9 ps-9 h-[33.14px]  font-medium flex w-full rounded-lg border border-input bg-background px-3 py-[6px] text-sm text-muted-foreground/70 transition-shadow",
              "hover:border-ring/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 group-data-[state=collapsed]:pe-0 group-data-[state=collapsed]:ps-0 group-data-[state=collapsed]:border-0",
            )}
            type="button">
            <span className="inline-flex group-data-[state=collapsed]:hidden">
              Search
            </span>
          </button>

          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-data-[state=collapsed]:ps-2 text-muted-foreground/80 peer-disabled:opacity-50 transition-all duration-100 ease-in-out ">
            <Search size={16} strokeWidth={2} />
          </div>
          {/* <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground group-data-[state=collapsed]:hidden">
            <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
              ⌘K
            </kbd>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default OpenSearchModal;
