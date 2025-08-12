import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import SimpleInput from "@/components/ui/form/SimpleInput";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import {User2, Calendar, Circle, ChevronDown, Trash2, MessageCircle, Briefcase} from "lucide-react";
import React, {useState, useMemo} from "react";
import {useProjectRequests} from "@/hooks/query/projects/use-project-requests";
import {motion, AnimatePresence} from "framer-motion";
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
import {cn} from "@/lib/utils";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import BulkActionsBar from "@/components/table/BulkActionsBar";
import usePersistedTableColumns from "@/hooks/usePersistedTableColumns";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {Skeleton} from "@/components/shadcn/skeleton";
import {Checkbox} from "@/components/shadcn/checkbox";
import {formatHumanDate} from "@/functions/formatDate";
import {renderOrDash, createProfileLink} from "@/utils/tableHelpers";
import Link from "next/link";
import ProjectRequestsActionsPopover from "./ProjectRequestsActionsPopover";
import {useManageProjectRequest} from "@/hooks/query/projects/use-manage-project-request";
import ConfirmationModal from "@/components/ui/dialog/ConfirmationModal";

interface ProjectRequest {
  id: string;
  project_id: string;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  position_id?: string;
  direction: "invite" | "application";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  role_id?: string;
  user_name: string;
  user_username: string;
  user_profile_image: {
    url: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }[];
  created_by_name: string;
  created_by_username: string;
  created_by_profile_image: {
    url: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }[];
  position_title?: string;
  // Cooldown/resend fields
  resend_count: number;
  next_allowed_at: string | null;
}

const ProjectManagementRequests = ({project, user}: {project: Project; user: User}) => {
  const [activeTab, setActiveTab] = useState("received");
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    {id: "status", desc: false},
    {id: "created_at", desc: true},
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [requestToCancel, setRequestToCancel] = useState<ProjectRequest | null>(null);
  const {data: requests, isLoading: isRequestsLoading} = useProjectRequests(project.id);
  const manageRequestMutation = useManageProjectRequest();

  // Column state management
  const {
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
  } = usePersistedTableColumns("requestsTablePrefs");

  const effectiveColumnVisibility = useMemo(() => {
    const visibility = {...columnVisibility};
    if (activeTab === "received") {
      visibility["created_by_name"] = false;
    }
    return visibility;
  }, [columnVisibility, activeTab]);

  // Filter requests based on active tab
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    if (activeTab === "received") {
      return requests.filter((req) => req.direction === "application");
    } else if (activeTab === "sent") {
      return requests.filter((req) => req.direction === "invite");
    }
    return requests;
  }, [requests, activeTab]);

  // Apply search query
  const data = useMemo(() => {
    if (!filteredRequests || !query) return filteredRequests || [];

    return filteredRequests.filter((request) => {
      const q = query.toLowerCase();
      return (
        request.user_name.toLowerCase().includes(q) ||
        request.user_username.toLowerCase().includes(q) ||
        request.status.toLowerCase().includes(q) ||
        request.direction.toLowerCase().includes(q) ||
        (request.created_by_name && request.created_by_name.toLowerCase().includes(q)) ||
        (request.created_by_username && request.created_by_username.toLowerCase().includes(q)) ||
        (request.position_id && request.position_id.toLowerCase().includes(q)) ||
        (request.position_title && request.position_title.toLowerCase().includes(q))
      );
    });
  }, [query, filteredRequests]);

  // Update tab counts
  const tabs: Tab[] = useMemo(
    () => [
      {
        value: "received",
        label: "Received",
        count: requests?.filter((req) => req.direction === "application").length || 0,
      },
      {
        value: "sent",
        label: "Sent",
        count: requests?.filter((req) => req.direction === "invite").length || 0,
      },
    ],
    [requests],
  );

  const statusConfig = {
    pending: {color: "bg-[#F5A623]", label: "Pending"},
    accepted: {color: "bg-[#009E61]", label: "Accepted"},
    rejected: {color: "bg-[#EF1A2C]", label: "Rejected"},
    cancelled: {color: "bg-[#6C757D]", label: "Cancelled"},
  };

  const getColumns = (): ColumnDef<ProjectRequest>[] => [
    {
      accessorKey: "user_name",
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
          <User2 className="w-3.5 h-3.5" />
          <span>{activeTab === "received" ? "Requester" : "Invited User"}</span>
        </div>
      ),
      cell: ({row}) => {
        const request = row.original as ProjectRequest;
        return (
          <div className="flex items-center gap-3">
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              className="mr-1"
            />
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.user_profile_image?.[0]?.url} alt={request.user_name} />
              <AvatarFallback>{request.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Link
              href={`/profiles/${request.user_username}`}
              className="leading-none text-foreground/90 hover:underline">
              {request.user_name}
            </Link>
          </div>
        );
      },
      size: 200,
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
        const positionTitle = row.original.position_title;
        return renderOrDash(positionTitle);
      },
      size: 200,
      minSize: 200,
    },
    {
      accessorKey: "created_by_name",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <User2 className="w-3.5 h-3.5" />
          <span>{activeTab === "received" ? "Sent by" : "Invited by"}</span>
        </div>
      ),
      cell: ({row}) => {
        const {
          created_by_name: name,
          created_by_username: username,
          created_by_profile_image,
        } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={created_by_profile_image?.[0]?.url} alt={name} />
              <AvatarFallback className="text-xs">{name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {createProfileLink(username, name)}
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
        const statusA = rowA.original.status;
        const statusB = rowB.original.status;
        return statusOrder[statusA] - statusOrder[statusB];
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center gap-1 leading-none">
          <Calendar className="w-3.5 h-3.5" />
          <span>{activeTab === "received" ? "Received At" : "Sent At"}</span>
        </div>
      ),
      cell: ({row}) => {
        const date = row.original.created_at;
        return renderOrDash(date ? formatHumanDate(date) : null);
      },
      size: 130,
      minSize: 130,
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
        const date = row.original.updated_at;
        return renderOrDash(date ? formatHumanDate(date) : null);
      },
      size: 130,
      minSize: 130,
    },

    {
      id: "actions",
      header: "",
      cell: ({row}) => {
        const request = row.original as ProjectRequest;
        console.log(request);
        const handleAcceptRequest = () =>
          manageRequestMutation.mutate({
            requestId: request.id,
            action: "accept",
            projectId: project.id,
          });

        const handleRejectRequest = () =>
          manageRequestMutation.mutate({
            requestId: request.id,
            action: "reject",
            projectId: project.id,
          });

        // Open confirmation modal instead of mutating directly
        const handleCancelInvitation = () => setRequestToCancel(request);

        const handleResendInvitation = () =>
          manageRequestMutation.mutate({
            requestId: request.id,
            action: "resend",
            projectId: project.id,
          });

        const handleReinvite = () =>
          manageRequestMutation.mutate({
            requestId: request.id,
            action: "reinvite",
            projectId: project.id,
          });

        const handleSendMessage = () => {
          console.log("Send message to:", request.user_username);
          // TODO: Implement send message logic
        };

        return (
          <ProjectRequestsActionsPopover
            requestDirection={request.direction}
            requestStatus={request.status}
            userName={request.user_name}
            userUsername={request.user_username}
            resendCount={request.resend_count}
            nextAllowedAt={request.next_allowed_at}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onCancelInvitation={handleCancelInvitation}
            onResendInvitation={handleResendInvitation}
            onSendMessage={handleSendMessage}
            onReinvite={handleReinvite}
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

  const handleDeleteRequests = () => {
    console.log(
      "Delete requests:",
      table.getSelectedRowModel().rows.map((r) => r.original.id),
    );
    table.resetRowSelection(false);
  };

  const handleSendMessage = () => {
    console.log(
      "Send message to:",
      table.getSelectedRowModel().rows.map((r) => r.original.id),
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
          activeTab === "received"
            ? ["user_name", "actions", "created_by_name"]
            : ["user_name", "actions"]
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
      id: "user_name",
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
      size: 200,
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
      id: "created_by_name",
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
      size: 130,
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
      size: 130,
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
        onTabChange={setActiveTab}>
        {(currentActiveTab) => (
          <>
            {isRequestsLoading ? (
              <motion.div
                key="skeleton"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}>
                <TableSkeleton columns={skeletonColumns} rowCount={5} />
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}>
                <div className="border border-border rounded-[10px] overflow-x-auto scrollbar-thin scrollbar-">
                  {/* Bulk actions bar */}
                  <BulkActionsBar
                    selectedCount={selectedCount}
                    onClearSelection={() => table.resetRowSelection(false)}
                    actions={[
                      {
                        label: "Send message",
                        icon: <MessageCircle className="w-4 h-4" />,
                        onClick: handleSendMessage,
                      },
                      {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4" />,
                        onClick: handleDeleteRequests,
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
                      <AnimatePresence initial={false} mode="popLayout">
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <motion.tr
                              key={row.original.id || row.id}
                              layout="position"
                              initial={{opacity: 0}}
                              animate={{opacity: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.2}}
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
                            </motion.tr>
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
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </FilterableTabs>

      {/* Cancel Invitation Confirmation Modal */}
      <ConfirmationModal
        id="cancel-invite-modal"
        triggerText=""
        title="Cancel Invitation"
        description={`Are you sure you want to cancel the invitation to "${requestToCancel?.user_name || ""}"? This action cannot be undone.`}
        requireInput={false}
        open={!!requestToCancel}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRequestToCancel(null);
          }
        }}
        onConfirm={async () => {
          if (!requestToCancel) return {error: "No request selected"};
          const result = await manageRequestMutation.mutateAsync({
            requestId: requestToCancel.id,
            action: "cancel",
            projectId: project.id,
          });

          if (!result.success) {
            return {error: result.message};
          }

          setRequestToCancel(null);
          // Avoid duplicate success toast; hook already toasts on success
          return {};
        }}
        confirmButtonText="Cancel Invitation">
        <div style={{display: "none"}} />
      </ConfirmationModal>
    </div>
  );
};

export default ProjectManagementRequests;
