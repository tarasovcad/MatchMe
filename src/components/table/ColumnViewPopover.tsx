import React, {useCallback, useMemo, useState} from "react";
import {Settings2, GripVertical, Check} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/shadcn/popover";
import {Command, CommandGroup, CommandList, CommandItem} from "@/components/shadcn/command";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {AnimatePresence, motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {useReactTable} from "@tanstack/react-table";

export interface ColumnViewPopoverProps<TData extends object> {
  table: ReturnType<typeof useReactTable<TData>>;
  hiddenColumnIds?: string[];
  trigger?: React.ReactNode;
}

function ColumnViewPopoverInner<TData extends object>(props: ColumnViewPopoverProps<TData>) {
  const {table, hiddenColumnIds = [""], trigger} = props;
  const [search, setSearch] = useState("");

  const columnOrder = (table.getState().columnOrder as string[]) || [];

  const columnLabelMap: Record<string, string> = {
    roleBadge: "Role",
    joinedDate: "Joined Date",
    invitedBy: "Invited By",
    invitedDate: "Invited Date",
    created_at: "Created At",
    posted_by: "Posted By",
    experience_level: "Experience Level",
    time_commitment: "Time Commitment",
    status: "Status",
    required_skills: "Required Skills",
    applications: "Applications",
    applicants: "Applicants",
    applicants_count: "Applicants Count",
    position_title: "Position Title",
    created_by_name: "Created By",
    updated_at: "Updated At",
  };

  const allLeaf = table.getAllLeafColumns();

  const filteredColumns = useMemo(() => {
    // Arrange columns according to current columnOrder
    const ordered =
      columnOrder.length > 0
        ? columnOrder
            .map((id) => allLeaf.find((c) => c.id === id))
            .filter((c): c is (typeof allLeaf)[number] => Boolean(c))
            .concat(allLeaf.filter((c) => !columnOrder.includes(c.id as string)))
        : allLeaf;

    return ordered
      .filter((col) => col.getCanHide())
      .filter((col) => !hiddenColumnIds.includes(col.id as string))
      .filter((col) => {
        if (!search) return true;
        const mappedLabel = columnLabelMap[col.id as string];
        const label = mappedLabel
          ? mappedLabel
          : typeof col.columnDef.header === "string"
            ? col.columnDef.header
            : typeof col.id === "string"
              ? col.id
              : "";
        return label.toLowerCase().includes(search.toLowerCase());
      });
  }, [allLeaf, columnOrder, search, hiddenColumnIds]);

  // Helpers ------------------------------------------------------------
  const moveItem = useCallback((arr: string[], from: number, to: number): string[] => {
    const next = [...arr];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    return next;
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, colId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", colId);
    e.currentTarget.classList.add("opacity-50");
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;

    const currentOrder = columnOrder.length ? columnOrder : (allLeaf.map((c) => c.id) as string[]);

    const fromIdx = currentOrder.indexOf(sourceId);
    const toIdx = currentOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = moveItem(currentOrder, fromIdx, toIdx);
    table.setColumnOrder(newOrder);
  };

  // -------------------------------------------------------------------
  const Trigger = trigger ? (
    trigger
  ) : (
    <Button variant="outline" size="xs">
      <Settings2 className="w-4 h-4" /> View
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="p-0 w-56 rounded-[10px] text-foreground/90 overflow-hidden bg-popover shadow-lg">
        <Command>
          {/* Search */}
          <div className="border-b border-border">
            <SimpleInput
              placeholder="Search columns..."
              type="search"
              id="column-search"
              search
              className="focus-visible:border-0 border-none focus-visible:outline-none ring-0 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList className="max-h-52 overflow-auto text-foreground/90">
            <CommandGroup className="p-1 capitalize">
              <AnimatePresence initial={false}>
                {filteredColumns.length ? (
                  filteredColumns.map((col) => {
                    let label = columnLabelMap[col.id as string];

                    if (!label) {
                      if (typeof col.columnDef.header === "string") {
                        label = col.columnDef.header;
                      } else if (typeof col.columnDef.header === "function") {
                        label = typeof col.id === "string" ? col.id : "";
                      } else {
                        label = col.id || "";
                      }
                    }

                    const isVisible = col.getIsVisible();

                    return (
                      <motion.div
                        key={col.id}
                        draggable
                        onDragStartCapture={(e) => handleDragStart(e, col.id as string)}
                        onDragEndCapture={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id as string)}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.15}}>
                        <CommandItem
                          onSelect={() => col.toggleVisibility(!isVisible)}
                          className={cn(
                            "w-full flex items-center gap-2 px-1.5 py-[5px] rounded-[5px] text-sm hover:bg-muted transition-colors duration-300 ease-in-out",
                          )}>
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{label}</span>
                          <AnimatePresence initial={false}>
                            {isVisible && (
                              <motion.span
                                key="check"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.15}}
                                className="flex items-center justify-center">
                                <Check className="w-4 h-4 text-muted-foreground" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </CommandItem>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="px-2 py-1.5 text-muted-foreground text-sm">
                    No results found
                  </motion.div>
                )}
              </AnimatePresence>
            </CommandGroup>
          </CommandList>
          {/* Reset order */}
          <button
            type="button"
            onClick={() => table.resetColumnOrder()}
            className="flex items-center gap-2 w-full text-sm px-4 py-[6px] border-t border-border hover:bg-muted">
            <Settings2 className="w-4 h-4" /> Reset Column Order
          </button>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnViewPopoverInner;
