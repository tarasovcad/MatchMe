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
  User as UserIcon,
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
import Link from "next/link";
import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import usePersistedTableColumns from "@/hooks/usePersistedTableColumns";
import {toast} from "sonner";
import {Button} from "@/components/shadcn/button";
import {Checkbox} from "@/components/shadcn/checkbox";
import BulkActionsBar from "@/components/table/BulkActionsBar";
import OpenPositionActionsPopover from "./OpenPositionActionsPopover";
import PositionDrawer from "./EditPositionDrawer";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {useProjectOpenPositions} from "@/hooks/query/projects/use-project-open-positions";
import {Skeleton} from "@/components/shadcn/skeleton";
import {
  createProfileLink,
  getOptionTitle,
  renderOrDash,
  renderSkills,
  tableStatusConfig,
} from "@/utils/tableHelpers";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {experienceLevels} from "@/data/projects/experienceLevels";

const ProjectManagementOpenPositions = ({project, user}: {project: Project; user: User}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ProjectOpenPosition | null>(null);

  // Fetch open positions data
  const {data: fetchedPositions, isLoading: isPositionsLoading} = useProjectOpenPositions(
    project.id,
  );

  // Transform database data to frontend format
  const transformedPositions = useMemo(() => {
    return (fetchedPositions ?? []).map(
      (pos: ProjectOpenPosition): ProjectOpenPosition => ({
        id: pos.id,
        project_id: pos.project_id,
        posted_by_user_id: pos.posted_by_user_id,
        posted_date: pos.posted_date,
        title: pos.title,
        description: pos.description || "",
        requirements: pos.requirements || "",
        required_skills: pos.required_skills || [],
        applicant_count: pos.applicant_count || 0,
        time_commitment: pos.time_commitment || "",
        experience_level: pos.experience_level || "",
        status: pos.status || "draft",
        created_at: pos.created_at,
        updated_at: pos.updated_at,
        posted_by_name: pos.posted_by_name,
        posted_by_username: pos.posted_by_username,
      }),
    );
  }, [fetchedPositions]);

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
    if (!query) return transformedPositions;

    return transformedPositions.filter((position) => {
      const q = query.toLowerCase();
      return (
        position.title.toLowerCase().includes(q) ||
        getOptionTitle(position.time_commitment, timeCommitment).toLowerCase().includes(q) ||
        position.status.toLowerCase().includes(q) ||
        getOptionTitle(position.experience_level, experienceLevels).toLowerCase().includes(q) ||
        position.required_skills.some((skill) => skill.toLowerCase().includes(q)) ||
        (position.posted_by_name && position.posted_by_name.toLowerCase().includes(q)) ||
        (position.posted_by_username && position.posted_by_username.toLowerCase().includes(q))
      );
    });
  }, [query, transformedPositions]);

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
      accessorKey: "experience_level",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Experience</span>
        </div>
      ),
      size: 150,
      minSize: 150,
      cell: ({row}) => (
        <span>{renderOrDash(getOptionTitle(row.original.experience_level, experienceLevels))}</span>
      ),
    },
    {
      accessorKey: "time_commitment",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Clock className="w-3.5 h-3.5" />
          <span>Time Commitment</span>
        </div>
      ),
      cell: ({row}) => (
        <span>{renderOrDash(getOptionTitle(row.original.time_commitment, timeCommitment))}</span>
      ),
      size: 200,
      minSize: 180,
    },

    {
      accessorKey: "required_skills",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skills</span>
        </div>
      ),
      size: 250,
      minSize: 200,
      cell: ({row}) => {
        const skills = row.original.required_skills;
        return <span>{renderSkills(skills)}</span>;
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
        const applicants = row.original.applicant_count;
        return <span>{applicants && applicants > 0 ? applicants : renderOrDash(applicants)}</span>;
      },
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "posted_by",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <UserIcon className="w-3.5 h-3.5" />
          <span>Posted By</span>
        </div>
      ),
      cell: ({row}) => {
        const {posted_by_name: name, posted_by_username: username} = row.original;
        return createProfileLink(username, name);
      },
      size: 180,
      minSize: 160,
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

        return (
          <div
            className={cn(
              "px-1.5 py-0.5 flex items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium border w-fit  leading-[14px]",
              "text-secondary border border-border bg-transparent",
            )}>
            <div className={cn("size-[5px] rounded-full", tableStatusConfig[status])} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
          setIsDrawerOpen(true);
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
            {isPositionsLoading ? <Skeleton className="h-3 w-4" /> : data.length}
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
            variant="secondary"
            size="xs"
            onClick={() => {
              setSelectedPosition(null); // Clear any selected position for create mode
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </div>

      {isPositionsLoading ? (
        <motion.div
          key="skeleton"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.3, ease: "easeInOut"}}>
          <div className="border border-border rounded-[10px] overflow-x-auto scrollbar-thin">
            <div className="p-6 text-center">
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
          </div>
        </motion.div>
      ) : (
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
      )}

      {/* Position Drawer */}
      <PositionDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        position={selectedPosition}
        projectId={project.id}
        mode={selectedPosition ? "edit" : "create"}
      />
    </div>
  );
};

export default ProjectManagementOpenPositions;
