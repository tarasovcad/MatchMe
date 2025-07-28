"use client";

import {
  User2,
  TrendingUp,
  Clock,
  Calendar,
  Shield,
  ChevronDown,
  Trash2,
  Sparkles,
  Briefcase,
  Award,
  UserPlus,
  CalendarPlus,
  MessageCircle,
} from "lucide-react";
import React, {useMemo, useState, useEffect} from "react";
import {formatHumanDate} from "@/functions/formatDate";
import {motion, AnimatePresence} from "framer-motion";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {Checkbox} from "@/components/shadcn/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/shadcn/avatar";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import ProjectRoleBadge, {ProjectRoleBadgeColorKey} from "@/components/ui/ProjectRoleBadge";
import Link from "next/link";
import {cn} from "@/lib/utils";
import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import TeamMemberActionsPopover from "./TeamMemberActionsPopover";
import BulkActionsBar from "@/components/table/BulkActionsBar";
import usePersistedTableColumns from "@/hooks/usePersistedTableColumns";
import {useProjectTeamMembers} from "@/hooks/query/projects/use-project-team-members";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {Skeleton} from "@/components/shadcn/skeleton";

type Member = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: string; // job title
  pronouns: string;
  seniority: string;
  availability: string;
  skills: string[];
  currentRole: string;
  yearsOfExperience: number | null;
  roleBadgeName: string; // e.g. Owner, Member
  roleBadgeColor: string | null; // color key for ProjectRoleBadge
  joinedDate: string;
  invitedByName: string;
  invitedByUsername: string;
  invitedDate: string;
};

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

const getColumns = (): ColumnDef<Member>[] => [
  {
    accessorKey: "name",
    header: ({table}) => (
      <div className="flex items-center gap-3">
        {(() => {
          const allPageSelected = table.getIsAllPageRowsSelected();
          const somePageSelected = table.getSelectedRowModel().rows.length > 0 && !allPageSelected;

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
        <span>Name</span>
      </div>
    ),
    cell: ({row}) => {
      const member = row.original as Member;
      return (
        <div className="flex items-center gap-3">
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="mr-1"
          />
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link
            href={`/profiles/${member.username}`}
            className="leading-none text-foreground/90 hover:underline">
            {member.name}
          </Link>
        </div>
      );
    },
    size: 200,
    minSize: 220,
  },
  {
    accessorKey: "currentRole",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Briefcase className="w-3.5 h-3.5" />
        <span>Current Role</span>
      </div>
    ),
    size: 200,
    minSize: 180,
    cell: ({row}) => <span>{renderOrDash(row.original.currentRole)}</span>,
  },
  {
    accessorKey: "pronouns",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <User2 className="w-3.5 h-3.5" />
        <span>Pronouns</span>
      </div>
    ),
    size: 150,
    minSize: 150,
    cell: ({row}) => <span>{renderOrDash(row.original.pronouns)}</span>,
  },
  {
    accessorKey: "seniority",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Seniority</span>
      </div>
    ),
    size: 150,
    minSize: 150,
    cell: ({row}) => <span>{renderOrDash(row.original.seniority)}</span>,
  },
  {
    accessorKey: "availability",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Clock className="w-3.5 h-3.5" />
        <span>Availability</span>
      </div>
    ),
    size: 150,
    minSize: 150,
    cell: ({row}) => <span>{renderOrDash(row.original.availability)}</span>,
  },
  {
    accessorKey: "yearsOfExperience",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Award className="w-3.5 h-3.5" />
        <span>Years Exp.</span>
      </div>
    ),
    size: 110,
    minSize: 100,
    cell: ({row}) => {
      const yrs = row.original.yearsOfExperience;
      return (
        <span>{yrs != null ? `${yrs} ${yrs === 1 ? "year" : "years"}` : renderOrDash(yrs)}</span>
      );
    },
  },
  {
    accessorKey: "skills",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Skills</span>
      </div>
    ),
    size: 250,
    minSize: 200,
    cell: ({row}) => {
      const skills = row.original.skills;
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
    accessorKey: "joinedDate",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Calendar className="w-3.5 h-3.5" />
        <span>Joined Date</span>
      </div>
    ),
    cell: ({row}) => {
      const date = row.original.joinedDate;
      return date ? <span>{formatHumanDate(date)}</span> : renderOrDash(date);
    },
  },
  {
    accessorKey: "invitedDate",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <CalendarPlus className="w-3.5 h-3.5" />
        <span>Invited Date</span>
      </div>
    ),
    cell: ({row}) => {
      const date = row.original.invitedDate;
      return date ? <span>{formatHumanDate(date)}</span> : renderOrDash(date);
    },
    size: 150,
    minSize: 150,
  },
  {
    accessorKey: "invitedByName",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <UserPlus className="w-3.5 h-3.5" />
        <span>Invited By</span>
      </div>
    ),
    cell: ({row}) => {
      const {invitedByName: name, invitedByUsername: inviterUsername, username} = row.original;
      // If the inviter is the same person (self-join) or no inviter recorded, show “System”.
      const isSystemInvite = !name || inviterUsername === username;

      if (isSystemInvite) {
        return <span className="text-muted-foreground">System</span>;
      }

      return (
        <Link
          href={`/profiles/${inviterUsername}`}
          className="leading-none text-foreground/90 hover:underline">
          {name}
        </Link>
      );
    },
    size: 180,
    minSize: 160,
  },
  {
    accessorKey: "roleBadgeName",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Shield className="w-3.5 h-3.5" />
        <span>Role</span>
      </div>
    ),
    size: 100,
    minSize: 90,
    cell: ({row}) => {
      const {roleBadgeName, roleBadgeColor} = row.original;
      const badgeColor = roleBadgeColor ? (roleBadgeColor as ProjectRoleBadgeColorKey) : undefined;
      return <ProjectRoleBadge color={badgeColor}>{roleBadgeName}</ProjectRoleBadge>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({row}) => {
      const member = row.original as Member;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return (
        <TeamMemberActionsPopover
          onViewProfile={() => window.open(`/profiles/${member.username}`, "_blank")}
          onCopyProfileLink={() =>
            navigator.clipboard.writeText(`${origin}/profiles/${member.username}`)
          }
          onChangeRole={() => console.log("Change role for", member.id)}
          onRemoveFromProject={() => console.log("Remove from project", member.id)}
          onSendDirectMessage={() => console.log("DM to", member.id)}
        />
      );
    },
    enableSorting: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
];

const ProjectManagementTeamMembers = ({project, user}: {project: Project; user: User}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  //  column state
  const {
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
  } = usePersistedTableColumns("teamMembersTablePrefs");

  const {data: fetchedMembers = [], isLoading: isMembersLoading} = useProjectTeamMembers(
    project.id,
  );

  console.log("fetchedMembers", fetchedMembers);

  // Transform fetched data into the shape expected by the table
  const formattedMembers: Member[] = useMemo(() => {
    return (fetchedMembers ?? []).map((m) => ({
      id: m.user_id,
      name: m.name,
      username: m.username,
      avatarUrl: m.profile_image?.[0]?.url ?? "",
      role: m.public_current_role ?? "",
      pronouns: m.pronouns ?? "",
      seniority: m.seniority_level ?? "",
      availability: m.work_availability != null ? `${m.work_availability}` : "",
      skills: m.skills ?? [],
      currentRole: m.public_current_role ?? "",
      yearsOfExperience: m.years_of_experience,
      roleBadgeName: m.role_name ?? "Member",
      roleBadgeColor: m.role_badge_color,
      joinedDate: m.joined_date ?? "",
      invitedByName: m.invited_by_name ?? "",
      invitedByUsername: m.invited_by_username ?? "",
      invitedDate: m.invited_at ?? "",
    }));
  }, [fetchedMembers]);

  const data = useMemo(() => {
    const baseMembers = formattedMembers.length ? formattedMembers : [];

    const rolePriority: Record<string, number> = {
      Owner: 1,
      "Co-founder": 2,
      Member: 3,
    };

    // Sort members by role priority, then by name
    const sortedMembers = [...baseMembers].sort((a, b) => {
      const aPriority = rolePriority[a.roleBadgeName] || 999;
      const bPriority = rolePriority[b.roleBadgeName] || 999;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.name.localeCompare(b.name);
    });

    if (!query) return sortedMembers;

    return sortedMembers.filter((member) => {
      const q = query.toLowerCase();
      return (
        member.name.toLowerCase().includes(q) ||
        member.username.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.pronouns.toLowerCase().includes(q) ||
        member.seniority.toLowerCase().includes(q) ||
        member.availability.toLowerCase().includes(q) ||
        member.skills.some((s) => s.toLowerCase().includes(q)) ||
        member.roleBadgeName.toLowerCase().includes(q) ||
        member.currentRole.toLowerCase().includes(q) ||
        member.yearsOfExperience?.toString().includes(q) ||
        member.invitedByName.toLowerCase().includes(q) ||
        member.invitedDate.toLowerCase().includes(q)
      );
    });
  }, [query, formattedMembers]);

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

  const handleChangeRole = () => {
    console.log(
      "Change role for:",
      table.getSelectedRowModel().rows.map((r) => r.original.id),
    );
    table.resetRowSelection(false);
  };

  // Define skeleton column configurations
  const skeletonColumns = [
    {
      id: "name",
      header: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
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
      id: "currentRole",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-20" />,
      size: 180,
    },
    {
      id: "pronouns",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-12" />,
      size: 150,
    },
    {
      id: "seniority",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-18" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-16" />,
      size: 150,
    },
    {
      id: "availability",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-14" />,
      size: 150,
    },
    {
      id: "yearsOfExperience",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-12" />,
      size: 110,
    },
    {
      id: "skills",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-12" />
        </div>
      ),
      cell: (
        <div className="flex flex-no-wrap gap-2 items-center">
          <Skeleton className="h-6 w-16 rounded-[6px]" />
          <Skeleton className="h-6 w-14 rounded-[6px]" />
          <Skeleton className="h-6 w-12 rounded-[6px]" />
        </div>
      ),
      size: 200,
    },
    {
      id: "joinedDate",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-20" />,
      size: 150,
    },
    {
      id: "invitedDate",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-20" />,
      size: 150,
    },
    {
      id: "invitedByName",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-16" />,
      size: 160,
    },
    {
      id: "roleBadgeName",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-8" />
        </div>
      ),
      cell: <Skeleton className="h-6 w-12 rounded-full" />,
      size: 90,
    },
    {
      id: "actions",
      header: <div className="w-full" />,
      cell: <Skeleton className="h-8 w-8 rounded-md" />,
      size: 50,
    },
  ];

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h4 className="font-medium text-foreground/90 text-lg">Team Members</h4>
          <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
            {formattedMembers.length}
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
          {/* <Button variant="outline" size="xs">
            <Filter className="w-4 h-4" /> Filter
          </Button> */}
          <ColumnViewPopover table={table} hiddenColumnIds={["name", "actions"]} />
          <TableSettingsPopover table={table} setColumnSizing={setColumnSizing} />
          {/* <Button variant="default" size="xs" className="ml-1">
            <PlusIcon className="w-4 h-4" /> Invite
          </Button> */}
        </div>
      </div>

      {isMembersLoading ? (
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
          <div className="border border-border rounded-[10px] overflow-x-auto scrollbar-thin">
            {/* Bulk actions bar */}
            <BulkActionsBar
              selectedCount={selectedCount}
              onClearSelection={() => table.resetRowSelection(false)}
              actions={[
                {
                  label: "Send message",
                  icon: <MessageCircle className="w-4 h-4" />,
                  onClick: handleChangeRole,
                },
                {
                  label: "Remove",
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: handleChangeRole,
                  className: "text-red-500 hover:text-red-700",
                },
              ]}
            />

            <Table style={{minWidth: table.getTotalSize()}} className="w-full ">
              <TableHeader className="bg-[#F9F9FA] dark:bg-[#101013] ">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-[#F9F9FA] dark:hover:bg-[#101013]">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "relative !p-2 !px-2.5 text-[13px] last:border-r-0 text-left font-medium text-secondary h-auto border-r border-border",
                          // header.index === 0
                          //   ? "sticky left-0 z-20 bg-[#F9F9FA] dark:bg-[#101013] after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                          //   : "border-r border-border",
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
                            className="absolute right-0 top-0 h-full w-2  cursor-col-resize select-none touch-none"
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
                              // cell.column.id === "name"
                              //   ? "sticky left-0 z-10 bg-background after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                              //   : "border-r border-border",
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
                      <TableCell colSpan={5} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectManagementTeamMembers;
