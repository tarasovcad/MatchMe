import {User} from "@supabase/supabase-js";
import React, {useMemo, useState} from "react";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import SimpleInput from "@/components/ui/form/SimpleInput";
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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/shadcn/avatar";
import {Checkbox} from "@/components/shadcn/checkbox";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import BulkActionsBar from "@/components/table/BulkActionsBar";
import {
  Calendar,
  Circle,
  ChevronDown,
  Briefcase,
  Building2,
  MessageCircle,
  Archive,
  FolderOpen,
} from "lucide-react";
import {cn} from "@/lib/utils";
import Link from "next/link";

import UserRequestsActionsPopover from "./UserRequestsActionsPopover";
import {formatTimeRelative} from "@/functions/formatDate";
import {useUserRequests} from "@/hooks/query/dashboard/use-user-requests";
import {useManageUserRequest} from "@/hooks/query/dashboard/use-manage-user-request";
import type {UserRequestForProfileTab as UserRequest} from "@/actions/projects/getUserRequests";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {Skeleton} from "@/components/shadcn/skeleton";
import {motion} from "framer-motion";
import {toast} from "sonner";
import ConfirmationModal from "@/components/ui/dialog/ConfirmationModal";

const RequestsTab = ({user}: {user: User}) => {
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    {id: "status", desc: false},
    {id: "created_at", desc: true},
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [requestToCancel, setRequestToCancel] = useState<UserRequest | null>(null);

  // --- Real data fetching ---
  const {data: allRequests, isLoading} = useUserRequests(user.id);
  const manageRequestMutation = useManageUserRequest(user.id);

  const filteredByTab = useMemo(() => {
    if (!allRequests) return [];

    if (activeTab === "sent") {
      return allRequests.filter((r) => r.direction === "application");
    }
    return allRequests.filter((r) => r.direction === "invite");
  }, [allRequests, activeTab]);

  const data = useMemo(() => {
    if (!filteredByTab || !query) return filteredByTab || [];

    const q = query.toLowerCase();
    return filteredByTab.filter((r) =>
      [
        r.project_title,
        r.project_slug,
        r.position_title || "",
        r.status,
        r.direction,
        r.invited_by,
        r.created_by_username,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [filteredByTab, query]);

  const tabs: Tab[] = useMemo(
    () => [
      {
        value: "received",
        label: "Received",
        count: allRequests?.filter((r) => r.direction === "invite").length || 0,
      },
      {
        value: "sent",
        label: "Sent",
        count: allRequests?.filter((r) => r.direction === "application").length || 0,
      },
    ],
    [allRequests],
  );

  const statusConfig = {
    pending: {color: "bg-[#F5A623]", label: "Pending"},
    accepted: {color: "bg-[#009E61]", label: "Accepted"},
    rejected: {color: "bg-[#EF1A2C]", label: "Rejected"},
    cancelled: {color: "bg-[#6C757D]", label: "Cancelled"},
  } as const;

  const getColumns = (): ColumnDef<UserRequest>[] => [
    {
      accessorKey: "project_title",
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
          <div className="flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Project</span>
          </div>
        </div>
      ),
      cell: ({row}) => {
        const r = row.original as UserRequest;
        return (
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              className="mr-1"
            />
            <Avatar className="h-6 w-6">
              <AvatarImage src={r.project_logo_url || undefined} alt={r.project_title} />
              <AvatarFallback>{r.project_title.charAt(0)}</AvatarFallback>
            </Avatar>
            <Link
              href={`/projects/${r.project_slug}`}
              className="leading-none text-foreground/90 hover:underline">
              {r.project_title}
            </Link>
          </div>
        );
      },
      size: 220,
      minSize: 220,
    },
    {
      accessorKey: "position_title",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Position Title</span>
        </div>
      ),
      cell: ({row}) => {
        const title = row.original.position_title;
        return title ? title : <span className="text-muted-foreground">—</span>;
      },
      size: 200,
      minSize: 200,
    },
    {
      accessorKey: "invited_by",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Building2 className="w-3.5 h-3.5" />
          <span>Invited by</span>
        </div>
      ),
      cell: ({row}) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={r.created_by_profile_image_url || undefined} alt={r.invited_by} />
              <AvatarFallback
                fallbackImage="/avatar/default-user-avatar.png"
                fallbackImageAlt="Default user avatar"
                className="text-xs">
                {r.invited_by?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Link
              href={`/profiles/${r.created_by_username}`}
              className="leading-none text-foreground/90 hover:underline">
              {r.invited_by}
            </Link>
          </div>
        );
      },
      size: 200,
      minSize: 180,
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
      minSize: 100,
      cell: ({row}) => {
        const status = row.original.status;
        const config = statusConfig[status];
        return (
          <div
            className={cn(
              "px-1.5 py-0.5 flex items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium border w-fit leading-[14px]",
              "text-secondary border border-border bg-transparent",
            )}>
            <div className={cn("size-[5px] rounded-full", config.color)} />
            {config.label}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusOrder = {pending: 0, accepted: 1, rejected: 2, cancelled: 3};
        return statusOrder[rowA.original.status] - statusOrder[rowB.original.status];
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Calendar className="w-3.5 h-3.5" />
          <span>{activeTab === "received" ? "Received At" : "Applied At"}</span>
        </div>
      ),
      cell: ({row}) => {
        const value = row.original.created_at;
        return value ? (
          <span>{formatTimeRelative(value)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      size: 160,
      minSize: 140,
    },
    {
      accessorKey: "updated_at",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Calendar className="w-3.5 h-3.5" />
          <span>Updated At</span>
        </div>
      ),
      cell: ({row}) => {
        const value = row.original.updated_at;
        return value ? (
          <span>{formatTimeRelative(value)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      size: 160,
      minSize: 140,
    },
    {
      id: "actions",
      header: "",
      cell: ({row}) => {
        const r = row.original;

        const isManageProcessing = manageRequestMutation.isPending;

        const handleAcceptInvite = async () => {
          const promise = manageRequestMutation
            .mutateAsync({
              requestId: r.id,
              action: "accept",
              projectId: r.project_id,
            })
            .then((res) => {
              if (!res.success) throw new Error(res.message || "Failed to accept invite");
              return res.message || "Invitation accepted";
            });
          toast.promise(promise, {
            loading: `Accepting invite to ${r.project_title}...`,
            success: (msg) => msg,
            error: (err) => (err instanceof Error ? err.message : "Failed to accept invite"),
          });
        };

        const handleRejectInvite = async () => {
          const promise = manageRequestMutation
            .mutateAsync({
              requestId: r.id,
              action: "reject",
              projectId: r.project_id,
            })
            .then((res) => {
              if (!res.success) throw new Error(res.message || "Failed to reject invite");
              return res.message || "Invitation declined";
            });
          toast.promise(promise, {
            loading: `Declining invite to ${r.project_title}...`,
            success: (msg) => msg,
            error: (err) => (err instanceof Error ? err.message : "Failed to reject invite"),
          });
        };

        const handleCancelApplication = () => {
          setRequestToCancel(r);
        };

        const onCopyProjectLink = async () => {
          const projectUrl = `${window.location.origin}/projects/${r.project_slug}`;
          try {
            await navigator.clipboard.writeText(projectUrl);
            toast.success("Project link copied to clipboard!");
          } catch (error) {
            console.error("Failed to copy link:", error);
            toast.error("Failed to copy link");
          }
        };

        return (
          <UserRequestsActionsPopover
            requestDirection={r.direction}
            requestStatus={r.status}
            projectSlug={r.project_slug}
            isManageProcessing={isManageProcessing}
            onAcceptInvite={handleAcceptInvite}
            onRejectInvite={handleRejectInvite}
            onCancelApplication={handleCancelApplication}
            onCopyProjectLink={onCopyProjectLink}
          />
        );
      },
      enableSorting: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
  ];

  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const effectiveColumnVisibility = useMemo(() => {
    const visibility = {...columnVisibility};
    // Hide "Invited by" column on sent, show on Received
    if (activeTab === "sent") {
      visibility["invited_by"] = false;
    }
    return visibility;
  }, [columnVisibility, activeTab]);

  const table = useReactTable({
    data,
    columns: getColumns(),
    state: {
      sorting,
      rowSelection,
      columnOrder,
      columnSizing,
      columnVisibility: effectiveColumnVisibility,
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
    enableMultiSort: true,
    isMultiSortEvent: () => true,
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  const handleBulkDelete = () => {
    console.log(
      "Bulk delete requests:",
      table.getSelectedRowModel().rows.map((r) => r.original.id),
    );
    table.resetRowSelection(false);
  };

  const handleBulkMessage = () => {
    console.log(
      "Bulk message:",
      table.getSelectedRowModel().rows.map((r) => r.original.project_slug),
    );
    table.resetRowSelection(false);
  };

  const customRightContent = (
    <div className="flex items-center gap-2">
      <SimpleInput
        placeholder="Search..."
        search
        className="max-w-[344px] w-full"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ColumnViewPopover
        table={table}
        hiddenColumnIds={
          activeTab === "sent"
            ? ["project_title", "actions", "invited_by"]
            : ["project_title", "actions"]
        }
      />
      <TableSettingsPopover
        table={table}
        setColumnSizing={setColumnSizing}
        defaultSorting={[
          {id: "status", desc: false},
          {id: "created_at", desc: true},
        ]}
        resetSorting={() => setSorting([])}
      />
    </div>
  );

  const skeletonColumns = [
    {
      id: "project_title",
      header: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ),
      size: 220,
    },
    {
      id: "position_title",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-24" />,
      size: 200,
    },
    {
      id: "invited_by",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: (
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      size: 200,
    },
    {
      id: "status",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-12" />
        </div>
      ),
      cell: <Skeleton className="h-6 w-20 rounded-[5px]" />,
      size: 120,
    },
    {
      id: "created_at",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-20" />,
      size: 160,
    },
    {
      id: "updated_at",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-20" />,
      size: 160,
    },
    {
      id: "actions",
      header: <div className="w-full" />,
      cell: <Skeleton className="h-4 w-4 rounded-md" />,
      size: 50,
    },
  ];

  return (
    <div className="w-full mx-auto space-y-6">
      <FilterableTabs
        tabs={tabs}
        defaultTab="received"
        searchPlaceholder="Search requests"
        displayFilterButton={false}
        topPadding={false}
        customRightContent={customRightContent}
        contentAnimated={!isLoading}
        onTabChange={(v) => {
          setActiveTab(v as "sent" | "received");
          setRowSelection({});
        }}>
        {(currentActiveTab) => (
          <>
            {isLoading ? (
              <div key="skeleton">
                <TableSkeleton columns={skeletonColumns} rowCount={5} />
              </div>
            ) : (
              <motion.div
                key="table"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}>
                <div className="border border-border rounded-[10px] overflow-x-auto">
                  <BulkActionsBar
                    selectedCount={selectedCount}
                    onClearSelection={() => table.resetRowSelection(false)}
                    actions={[
                      {
                        label: "Send message",
                        icon: <MessageCircle className="w-4 h-4" />,
                        disabled: true,
                        onClick: handleBulkMessage,
                      },
                      {
                        label: "Archive",
                        icon: <Archive className="w-4 h-4" />,
                        onClick: handleBulkDelete,
                        disabled: true,
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
                            data-state={row.getIsSelected() && "selected"}
                            className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-border transition-colors">
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
                        <motion.tr
                          key="no-results"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          className="border-b">
                          <TableCell colSpan={15} className="h-24 text-center">
                            No {currentActiveTab} requests found.
                          </TableCell>
                        </motion.tr>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </FilterableTabs>

      <ConfirmationModal
        id="cancel-user-request-modal"
        triggerText=""
        title="Cancel Request"
        description={`Are you sure you want to cancel your application to "${requestToCancel?.project_title || ""}"? This action cannot be undone.`}
        requireInput={false}
        open={!!requestToCancel}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRequestToCancel(null);
          }
        }}
        onConfirm={async () => {
          if (!requestToCancel) return {};
          const promise = manageRequestMutation
            .mutateAsync({
              requestId: requestToCancel.id,
              action: "cancel",
              projectId: requestToCancel.project_id,
            })
            .then((res) => {
              if (!res.success) throw new Error(res.message || "Failed to cancel application");
              return res.message || "Application cancelled";
            });
          toast.promise(promise, {
            loading: `Cancelling application to ${requestToCancel.project_title}...`,
            success: (msg) => msg,
            error: (err) => (err instanceof Error ? err.message : "Failed to cancel application"),
          });
          setRequestToCancel(null);
          return {};
        }}
        confirmButtonText="Cancel Request">
        <div style={{display: "none"}} />
      </ConfirmationModal>
    </div>
  );
};

export default RequestsTab;
