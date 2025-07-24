"use client";

import {
  ArrowUpDown,
  Filter,
  MoreHorizontal,
  Settings2,
  PlusIcon,
  MoreVertical,
  User2,
  TrendingUp,
  Clock,
  Calendar,
  Shield,
} from "lucide-react";
import React, {useMemo, useState} from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {Button} from "@/components/shadcn/button";
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
import {Badge} from "@/components/shadcn/badge";
import Link from "next/link";
import {cn} from "@/lib/utils";

// ----------------------------------------------------------------------------
// Types & Fake Data
// ----------------------------------------------------------------------------

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
  roleBadge: "Owner" | "Admin" | "Member";
  joinedDate: string;
};

const FAKE_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Arthur Khan",
    username: "arthurass",
    avatarUrl: "",
    role: "Full-Stack Developer",
    pronouns: "She/Her",
    seniority: "Senior",
    availability: "Full-time",
    skills: ["React", "Node.js"],
    roleBadge: "Owner",
    joinedDate: "Dec 12, 2024",
  },
  {
    id: "2",
    name: "Ivanna Ramoss",
    username: "ivanna_ramoss",
    avatarUrl: "",
    role: "Data Scientist",
    pronouns: "He/Him",
    seniority: "Mid",
    availability: "Part-time",
    skills: ["Python", "Tensor"],
    roleBadge: "Member",
    joinedDate: "Dec 27, 2024",
  },
  {
    id: "3",
    name: "Karman Singth",
    username: "karman1631",
    avatarUrl: "",
    role: "UI/UX Designer",
    pronouns: "She/Her",
    seniority: "Senior",
    availability: "Contract",
    skills: ["Figma", "Illustrator"],
    roleBadge: "Member",
    joinedDate: "Jan 21, 2025",
  },
  {
    id: "4",
    name: "Alice Smith",
    username: "allis_smith",
    avatarUrl: "",
    role: "Backend Developer",
    pronouns: "He/Him",
    seniority: "Junior",
    availability: "Full-time",
    skills: ["Go", "PostgreSQL"],
    roleBadge: "Member",
    joinedDate: "Jan 25, 2025",
  },
  {
    id: "5",
    name: "John Smith",
    username: "johncanada",
    avatarUrl: "/public/test.png",
    role: "Marketing Specialist",
    pronouns: "He/Him",
    seniority: "Senior",
    availability: "Part-time",
    skills: ["SEO", "Analytics"],
    roleBadge: "Admin",
    joinedDate: "Jan 30, 2025",
  },
];

// ----------------------------------------------------------------------------
// Column Definitions
// ----------------------------------------------------------------------------

const getColumns = (): ColumnDef<Member>[] => [
  // Combined select checkbox with Name column
  {
    accessorKey: "name",
    header: ({table}) => (
      <div className="flex items-center gap-3">
        {/* Header checkbox: shows a line (indeterminate) when some but not all rows are selected */}
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
    accessorKey: "pronouns",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <User2 className="w-3.5 h-3.5" />
        <span>Pronouns</span>
      </div>
    ),
    size: 110,
    minSize: 110,
    cell: ({row}) => <span>{row.original.pronouns}</span>,
  },
  {
    accessorKey: "seniority",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Seniority</span>
      </div>
    ),
    size: 120,
    minSize: 120,
    cell: ({row}) => <span>{row.original.seniority}</span>,
  },
  {
    accessorKey: "availability",
    header: () => (
      <div className="flex items-center gap-1 leading-none">
        <Clock className="w-3.5 h-3.5" />
        <span>Availability</span>
      </div>
    ),
    size: 130,
    minSize: 130,
    cell: ({row}) => <span>{row.original.availability}</span>,
  },
  // {
  //   accessorKey: "skills",
  //   header: "Skills",
  //   size: 340,
  //   minSize: 300,
  //   cell: ({row}) => (
  //     <div className="flex flex-wrap  gap-1">
  //       {row.original.skills.map((skill) => (
  //         <Badge key={skill} variant="secondary" className="bg-muted text-foreground">
  //           {skill}
  //         </Badge>
  //       ))}
  //     </div>
  //   ),
  // },

  {
    accessorKey: "joinedDate",
    header: () => (
      <div className="flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" />
        <span>Joined Date</span>
      </div>
    ),
    cell: ({row}) => <span>{row.original.joinedDate}</span>,
  },
  {
    accessorKey: "roleBadge",
    header: () => (
      <div className="flex items-center gap-1">
        <Shield className="w-3.5 h-3.5" />
        <span>Role</span>
      </div>
    ),
    size: 100,
    minSize: 90,
    cell: ({row}) => {
      const colorMap: Record<Member["roleBadge"], string> = {
        Owner: "bg-purple-100 text-purple-800",
        Admin: "bg-orange-100 text-orange-800",
        Member: "bg-blue-100 text-blue-800",
      };
      return (
        <Badge variant="secondary" className={colorMap[row.original.roleBadge] ?? ""}>
          {row.original.roleBadge}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button type="button" className="p-1 rounded hover:bg-muted cursor-pointer">
        <MoreVertical className="w-4 h-4 transition-all duration-200  text-muted-foreground group-hover:text-foreground/60" />
      </button>
    ),
    enableSorting: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
];

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

const ProjectManagementTeamMembers = ({project, user}: {project: Project; user: User}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState<string>("");

  const data = useMemo(() => {
    if (!query) return FAKE_MEMBERS;
    return FAKE_MEMBERS.filter((member) => {
      const q = query.toLowerCase();
      return (
        member.name.toLowerCase().includes(q) ||
        member.username.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.pronouns.toLowerCase().includes(q) ||
        member.seniority.toLowerCase().includes(q) ||
        member.availability.toLowerCase().includes(q) ||
        member.skills.some((s) => s.toLowerCase().includes(q)) ||
        member.roleBadge.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const table = useReactTable({
    data,
    columns: getColumns(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h4 className="font-medium text-foreground/90 text-lg">Team Members</h4>
          <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
            {FAKE_MEMBERS.length}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SimpleInput
            placeholder="Search..."
            search
            className="max-w-[344px] w-full"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline" size="xs">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" size="xs">
            <Settings2 className="w-4 h-4" /> Customize
          </Button>
          <Button variant="default" size="xs" className="ml-1">
            <PlusIcon className="w-4 h-4" /> Invite
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-[10px] overflow-x-auto">
        <Table style={{minWidth: table.getTotalSize()}} className="w-full ">
          <TableHeader className="bg-[#F9F9FA] dark:bg-[#101013]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-[#F9F9FA] dark:hover:bg-[#101013]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "p-2 px-2.5 text-[13px] last:border-r-0 text-left font-medium text-secondary h-auto",
                      header.index === 0
                        ? "sticky left-0 z-20 bg-[#F9F9FA] dark:bg-[#101013] after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                        : "border-r border-border",
                    )}
                    style={{width: header.getSize()}}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-2.5 last:border-r-0 py-1 text-left text-foreground",
                        cell.column.id === "name"
                          ? "sticky left-0 z-10 bg-background after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                          : "border-r border-border",
                      )}
                      style={{width: cell.column.getSize()}}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectManagementTeamMembers;
