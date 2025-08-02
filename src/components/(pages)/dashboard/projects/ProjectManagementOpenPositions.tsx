"use client";

import {
  Clock,
  ChevronDown,
  Briefcase,
  DollarSign,
  Users,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  TrendingUp,
  FileText,
  List,
  Sparkles,
  Circle,
} from "lucide-react";
import React, {useMemo, useState} from "react";
import {motion} from "framer-motion";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import {Badge} from "@/components/shadcn/badge";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import {cn} from "@/lib/utils";
import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import usePersistedTableColumns from "@/hooks/usePersistedTableColumns";
import {toast} from "sonner";
import {Button} from "@/components/shadcn/button";
import {Checkbox} from "@/components/shadcn/checkbox";
import BulkActionsBar from "@/components/table/BulkActionsBar";
import OpenPositionActionsPopover from "./OpenPositionActionsPopover";
import EditPositionDrawer from "./EditPositionDrawer";
import {mockPositions} from "@/data/mockPositions";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

const renderOrDash = (value: React.ReactNode) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <span className="text-muted-foreground">—</span>;
  }
  return value;
};

const ProjectManagementOpenPositions = ({project, user}: {project: Project; user: User}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ProjectOpenPosition | null>(null);

  //  column state
  const {
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
  } = usePersistedTableColumns("openPositionsTablePrefs");

  const data = useMemo(() => {
    if (!query) return mockPositions;

    return mockPositions.filter((position) => {
      const q = query.toLowerCase();
      return (
        position.title.toLowerCase().includes(q) ||
        position.timeCommitment.toLowerCase().includes(q) ||
        position.status.toLowerCase().includes(q) ||
        position.experienceLevel.toLowerCase().includes(q) ||
        position.requiredSkills.some((skill) => skill.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const getColumns = (): ColumnDef<ProjectOpenPosition>[] => [
    {
      accessorKey: "title",
      header: ({table}) => (
        <div className="flex items-center gap-3">
          {(() => {
            const allPageSelected = table.getIsAllPageRowsSelected();
            const somePageSelected =
              table.getSelectedRowModel().rows.length > 0 && !allPageSelected;

            const checked: boolean | "indeterminate" = allPageSelected
              ? true
              : somePageSelected
                ? "indeterminate"
                : false;

            return (
              <Checkbox
                aria-label="Select all"
                checked={checked}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              />
            );
          })()}
          <Briefcase className="w-3.5 h-3.5" />
          <span>Title</span>
        </div>
      ),
      cell: ({row}) => {
        const position = row.original as ProjectOpenPosition;
        return (
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              className="mr-1"
            />
            <span>{renderOrDash(position.title)}</span>
          </div>
        );
      },
      size: 280,
      minSize: 250,
    },
    {
      accessorKey: "experienceLevel",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Experience</span>
        </div>
      ),
      size: 150,
      minSize: 150,
      cell: ({row}) => <span>{renderOrDash(row.original.experienceLevel)}</span>,
    },
    {
      accessorKey: "timeCommitment",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Clock className="w-3.5 h-3.5" />
          <span>Time Commitment</span>
        </div>
      ),
      cell: ({row}) => <span>{renderOrDash(row.original.timeCommitment)}</span>,
      size: 200,
      minSize: 180,
    },

    {
      accessorKey: "requiredSkills",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skills</span>
        </div>
      ),
      size: 250,
      minSize: 200,
      cell: ({row}) => {
        const skills = row.original.requiredSkills;
        if (!skills || skills.length === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-no-wrap gap-2 items-center ">
            {skills.slice(0, 3).map((s) => (
              <div
                key={s}
                className="h-6 bg-tag dark:bg-muted border border-input rounded-[6px] font-medium text-xs px-2 flex items-center text-foreground">
                {s}
              </div>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground">+{skills.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "applicants",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Applicants</span>
        </div>
      ),
      cell: ({row}) => {
        const applicants = row.original.applicants;
        return <span>{applicants > 0 ? applicants : renderOrDash(applicants)}</span>;
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Circle className="w-3.5 h-3.5" />
          <span>Status</span>
        </div>
      ),
      size: 120,
      cell: ({row}) => {
        const status = row.original.status;
        const statusConfig = {
          Open: "bg-[#009E61]",
          Closed: "bg-[#EF1A2C]",
          Draft: "bg-[#F5A623]",
        };

        return (
          <div
            className={cn(
              "px-1.5 py-0.5 flex items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium border w-fit  leading-[14px]",
              "text-secondary border border-border bg-transparent",
            )}>
            <div className={cn("size-[5px] rounded-full", statusConfig[status])} />
            {status}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "",
      cell: ({row}) => {
        const position = row.original as ProjectOpenPosition;

        const handleEditPosition = () => {
          setSelectedPosition(position);
          setIsEditDrawerOpen(true);
        };

        return (
          <OpenPositionActionsPopover
            onEditPosition={handleEditPosition}
            onClosePosition={() => {}}
            onViewApplicants={() => {}}
            onDeletePosition={() => {}}
            onPinToTop={() => {}}
            positionStatus={position.status}
          />
        );
      },
      enableSorting: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
  ];

  const table = useReactTable({
    data,
    columns: getColumns(),
    state: {
      sorting,
      rowSelection,
      columnOrder,
      columnSizing,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = table.getSelectedRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;

  const handleDeletePositions = () => {
    console.log(
      "Delete positions:",
      selectedRows.map((r) => r.original.id),
    );
    toast.success(`Deleted ${selectedCount} position${selectedCount === 1 ? "" : "s"}`);
    table.resetRowSelection(false);
  };

  const handleEditPositions = () => {
    console.log(
      "Edit positions:",
      selectedRows.map((r) => r.original.id),
    );
    toast.success(`Editing ${selectedCount} position${selectedCount === 1 ? "" : "s"}`);
    table.resetRowSelection(false);
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h4 className="font-medium text-foreground/90 text-lg">Open Positions</h4>
          <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
            {data.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimpleInput
            placeholder="Search..."
            search
            className="max-w-[344px] w-full"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ColumnViewPopover table={table} hiddenColumnIds={["title", "actions"]} />
          <TableSettingsPopover table={table} setColumnSizing={setColumnSizing} />
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              // Does nothing for now
            }}
            className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </div>

      <motion.div
        key="table"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: 0.3, ease: "easeInOut"}}>
        <div className="border border-border rounded-[10px] overflow-x-auto scrollbar-thin">
          {/* Bulk actions bar */}
          <BulkActionsBar
            selectedCount={selectedCount}
            onClearSelection={() => table.resetRowSelection(false)}
            actions={[
              {
                label: "Edit",
                icon: <Edit className="w-4 h-4" />,
                onClick: handleEditPositions,
              },
              {
                label: "Delete",
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleDeletePositions,
                className: "text-red-500 hover:text-red-700",
              },
            ]}
          />

          <Table style={{minWidth: table.getTotalSize()}} className="w-full">
            <TableHeader className="bg-[#F9F9FA] dark:bg-[#101013]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-[#F9F9FA] dark:hover:bg-[#101013]">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "relative !p-2 !px-2.5 text-[13px] last:border-r-0 text-left font-medium text-secondary h-auto border-r border-border",
                      )}
                      style={{width: header.getSize()}}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between w-full">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ColumnHeaderPopover column={header.column}>
                              <ChevronDown className="w-3.5 h-3.5 pl-1 text-muted-foreground hover:text-foreground transition-colors" />
                            </ColumnHeaderPopover>
                          )}
                        </div>
                      )}
                      {/* Resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none"
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.id || row.id}
                    className="hover:bg-muted/50 border-b border-border transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-2.5 last:border-r-0 py-1 text-left text-foreground border-r border-border",
                        )}
                        style={{width: cell.column.getSize()}}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-b">
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Edit Position Drawer */}
      <EditPositionDrawer
        isOpen={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        position={selectedPosition}
      />
    </div>
  );
};

export default ProjectManagementOpenPositions;
