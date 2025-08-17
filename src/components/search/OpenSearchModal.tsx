import React, {useState} from "react";
import {Search} from "lucide-react";
import {cn} from "@/lib/utils";
import SimpleInput from "../ui/form/SimpleInput";
import {SearchCommandDialog} from "./SearchCommandDialog";

export const OpenSearchModal = ({
  className,
  type,
}: {
  className?: string;
  type: "profiles" | "projects" | "sidebar";
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (type === "sidebar") {
    return (
      <>
        <div className="hidden group-data-[state=collapsed]:hidden md:block space-y-2 px-2 transition-opacity duration-300 ease-in-out">
          <div className="relative">
            <button
              className={cn(
                "transition-all duration-300 ease-in-out  peer pe-9 ps-9  font-medium flex w-full rounded-lg border border-input bg-sidebar px-3 py-[6px] text-sm text-muted-foreground/70  group-data-[state=collapsed]:pe-0 group-data-[state=collapsed]:ps-0 group-data-[state=collapsed]:border-0 cursor-pointer hover:border-ring/20 hover:bg-accent hover:text-accent-foreground/60",
              )}
              type="button"
              onClick={() => setIsDialogOpen(true)}>
              <span className="group-data-[state=collapsed]:hidden inline-flex">Search</span>
            </button>

            <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 group-data-[state=collapsed]:ps-2 text-muted-foreground/80 transition-all duration-100 ease-in-out pointer-events-none start-0">
              <Search size={16} strokeWidth={1} />
            </div>
            <div className="group-data-[state=collapsed]:hidden absolute inset-y-0 flex justify-center items-center pe-2 text-muted-foreground pointer-events-none end-0">
              <kbd className="inline-flex items-center px-1 border border-border rounded h-5 max-h-full font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <SearchCommandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </>
    );
  }

  return (
    <>
      <div onClick={() => setIsDialogOpen(true)}>
        <SimpleInput
          placeholder={"Search..."}
          className="hover:border-ring/20 hover:bg-muted/60 hover:text-accent-foreground/60 transition-all duration-300 ease-in-out cursor-pointer"
          type="search"
          id="search"
          search={true}
          loadingPlacement="left"
          showKbd={true}
          kbdText="⌘K"
          kbdPlacement="right"
          readOnly={true}
        />
      </div>

      <SearchCommandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};
