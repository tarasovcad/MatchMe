"use client";

import React, {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {isEqual} from "lodash";
import {
  ChevronRight,
  ChevronDown,
  Lock,
  MoreVertical,
  Pencil,
  Star,
  RefreshCcw,
  Trash2,
  PlusIcon,
  Eye,
  Bell,
} from "lucide-react";

import {Checkbox} from "@/components/shadcn/checkbox";
import {Button} from "@/components/shadcn/button";
import RoleDialog, {AddRoleFormData} from "./RoleDialog";
import {cn} from "@/lib/utils";
import {motion, AnimatePresence} from "framer-motion";

// TanStack query hook to fetch roles
import {useProjectRoles} from "@/hooks/query/projects/use-project-roles";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";
import type {UpdatableRole} from "@/actions/projects/updateProjectRoles";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {
  createDefaultPermissions,
  memberPermissions,
  coFounderPermissions,
} from "@/data/projects/defaultProjectRoles";
import ProjectRoleBadge, {ProjectRoleBadgeColorKey} from "@/components/ui/ProjectRoleBadge";
import ColumnViewPopover from "@/components/table/ColumnViewPopover";
import TableSettingsPopover from "@/components/table/TableSettingsPopover";
import ColumnHeaderPopover from "@/components/table/ColumnHeaderPopover";
import OptionsPopover from "@/components/ui/options/OptionsPopover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {Skeleton} from "@/components/shadcn/skeleton";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import usePersistedTableColumns from "@/hooks/usePersistedTableColumns";

// Available permission actions and the order in which we want to display them
type PermissionKey = "view" | "create" | "update" | "delete" | "notification";
const PERMISSION_ORDER: PermissionKey[] = ["view", "create", "update", "delete", "notification"];
const PERMISSION_COLUMN_IDS: Record<PermissionKey, string> = {
  view: "view_count",
  create: "create_count",
  update: "update_count",
  delete: "delete_count",
  notification: "notification_count",
};

interface PermissionManagementProps {
  projectId: string;
  onRolesChange?: (changed: UpdatableRole[]) => void;
  resetSignal?: boolean;
  isReadOnly?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const PermissionManagement = ({
  projectId,
  onRolesChange,
  resetSignal,
  isReadOnly = false,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: PermissionManagementProps) => {
  const {data: roles, isLoading: isRolesLoading} = useProjectRoles(projectId);

  // Keeps track of which roles rows are expanded in the UI
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const originalRolesRef = useRef<ProjectRoleDb[]>([]);

  // Local editable copy of roles. All UI modifications happen here.
  const [localRoles, setLocalRoles] = useState<ProjectRoleDb[]>([]);
  // Track deleted role ids to include them in the change set sent upwards
  const deletedRoleIdsRef = useRef<Set<string>>(new Set());

  // Track role currently being edited
  const [roleToEdit, setRoleToEdit] = useState<ProjectRoleDb | null>(null);

  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // TanStack table state
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
  } = usePersistedTableColumns("rolesPermissionsTablePrefs");

  // Stabilize parent callback to avoid effect loops when its identity changes
  const onRolesChangeRef = useRef<((changed: UpdatableRole[]) => void) | undefined>(onRolesChange);
  useEffect(() => {
    onRolesChangeRef.current = onRolesChange;
  }, [onRolesChange]);

  // Prevent redundant emissions that can cause unnecessary parent re-renders
  const lastEmittedRef = useRef<string>("");

  // Handle updates coming from the edit dialog
  const handleUpdateRole = (updated: {id: string; name: string; color: string}) => {
    setLocalRoles((prev: ProjectRoleDb[]) =>
      prev.map((role) => {
        if (role.id !== updated.id) return role;

        // Owner / member roles cannot be renamed, preserve their names if passed differently
        const isOwnerOrMember = isOwnerRole(role) || role.name.toLowerCase() === "member";

        return {
          ...role,
          name: isOwnerOrMember ? role.name : updated.name,
          badge_color: updated.color,
          updated_at: new Date().toISOString(),
        };
      }),
    );
  };

  // Add new role from child dialog
  const handleAddRole = ({name, color, inheritFrom}: AddRoleFormData) => {
    // Copy permissions from selected template if provided
    let templatePermissions: Record<string, Record<string, boolean>> = {};
    if (inheritFrom && inheritFrom !== "Start from scratch") {
      const templateRole = localRoles.find((r) => r.name === inheritFrom);
      if (templateRole) {
        templatePermissions = {...templateRole.permissions};
      }
    } else if (inheritFrom === "Start from scratch") {
      // Create all permissions with false values
      templatePermissions = createDefaultPermissions();
    }

    const newRole: ProjectRoleDb = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      name,
      badge_color: color,
      is_default: false,
      is_system_role: false,
      permissions: templatePermissions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLocalRoles((prev) => [...prev, newRole]);
  };

  // Keep a copy of roles on first fetch so we can always reset back to it.
  useEffect(() => {
    if (roles) {
      originalRolesRef.current = roles;
      setLocalRoles(roles);
      deletedRoleIdsRef.current.clear();
    }
  }, [roles]);

  // Reset back to original data when parent toggles the signal.
  useEffect(() => {
    setLocalRoles(originalRolesRef.current);
    deletedRoleIdsRef.current.clear();
  }, [resetSignal]);

  // Delete role locally
  const handleDeleteRole = (roleId: string) => {
    // Remember deletions so parent can submit them
    deletedRoleIdsRef.current.add(roleId);
    setLocalRoles((prev) => prev.filter((r) => r.id !== roleId));
  };

  // Calculate which roles have changed compared with the original dataset and
  // notify parent component so it can enable / disable the Save button.
  useEffect(() => {
    const handler = onRolesChangeRef.current;
    if (!handler) return;

    // 1. Detect changed or new roles
    const changedOrNew = localRoles.filter((role) => {
      const original = originalRolesRef.current.find((r) => r.id === role.id);
      return !original || !isEqual(role, original);
    });

    // 2. Detect deleted roles
    const deletedRoles = Array.from(deletedRoleIdsRef.current).map((id) => ({
      id,
      _deleted: true,
    })) as unknown as ProjectRoleDb[];

    const payloadArray = [...changedOrNew, ...deletedRoles];
    // If there are no changes, avoid notifying
    if (payloadArray.length === 0) return;

    // Avoid notifying with identical payloads repeatedly
    const payloadKey = JSON.stringify(payloadArray);
    if (payloadKey === lastEmittedRef.current) return;
    lastEmittedRef.current = payloadKey;

    handler(payloadArray);
  }, [localRoles]);

  // Sort roles: Owner → Co-Founder → Member → rest by updated_at desc
  const sortedRoles = useMemo(() => {
    if (!localRoles) return [];
    const priority: Record<string, number> = {
      owner: 0,
      "co-founder": 1,
      cofounder: 1,
      co_owner: 1,
      member: 2,
    };

    return [...localRoles].sort((a, b) => {
      const aKey = a.name.toLowerCase();
      const bKey = b.name.toLowerCase();
      const aRank = priority[aKey] ?? 3;
      const bRank = priority[bKey] ?? 3;

      if (aRank !== bRank) return aRank - bRank;

      const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [localRoles]);

  // Filter roles based on search query
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return sortedRoles;
    const query = searchQuery.trim().toLowerCase();
    return sortedRoles.filter((role) => role.name.toLowerCase().includes(query));
  }, [searchQuery, sortedRoles]);

  // Expand the owner role on first load
  useEffect(() => {
    if (roles && Object.keys(expandedRoles).length === 0) {
      const ownerRole = roles.find((r) => r.id === "owner" || r.name.toLowerCase() === "owner");
      if (ownerRole) {
        setExpandedRoles({[ownerRole.id]: true});
      }
    }
  }, [roles]);

  const toggleExpanded = useCallback((roleId: string) => {
    setExpandedRoles((prev: Record<string, boolean>) => {
      const isCurrentlyExpanded = prev[roleId];
      if (isCurrentlyExpanded) {
        return {...prev, [roleId]: false};
      }
      return {[roleId]: true};
    });
  }, []);

  const updatePermission = useCallback(
    (roleId: string, resourceId: string, permissionType: PermissionKey) => {
      setLocalRoles((prev: ProjectRoleDb[]) =>
        prev.map((role) => {
          if (role.id !== roleId) return role;

          const updatedPermissions = {...(role.permissions || {})};
          const resourcePermissions = {...(updatedPermissions[resourceId] || {})};

          const currentValue = Boolean(resourcePermissions[permissionType]);
          const newValue = !currentValue;
          resourcePermissions[permissionType] = newValue;

          // If enabling any non-view permission, ensure view is enabled automatically
          if (permissionType !== "view" && newValue) {
            resourcePermissions.view = true;
          }

          // If disabling view, automatically disable all other permissions for this resource
          if (permissionType === "view" && !newValue) {
            PERMISSION_ORDER.forEach((perm) => {
              if (perm !== "view") {
                resourcePermissions[perm] = false;
              }
            });
          }

          updatedPermissions[resourceId] = resourcePermissions;

          return {
            ...role,
            permissions: updatedPermissions,
          };
        }),
      );
    },
    [],
  );

  // Reset role permissions back to template defaults for Member or Co-Founder roles
  const resetRolePermissions = useCallback((roleId: string) => {
    setLocalRoles((prev: ProjectRoleDb[]) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;

        const roleName = role.name.toLowerCase();

        let template: Record<string, Record<string, boolean>> | null = null;
        if (roleName === "member") {
          template = {...memberPermissions};
        } else if (
          roleName === "co-founder" ||
          roleName === "cofounder" ||
          roleName === "co_owner"
        ) {
          template = {...coFounderPermissions};
        }

        if (!template) return role;

        if (isEqual(role.permissions, template)) {
          return role;
        }

        const originalRole = originalRolesRef.current.find((r) => r.id === role.id);

        return {
          ...role,
          permissions: template,
          updated_at: originalRole?.updated_at ?? role.updated_at,
        };
      }),
    );
  }, []);

  const renderPermissionCheckbox = (
    allowed: boolean | undefined,
    isEditable: boolean,
    onChange: () => void,
  ) => {
    return (
      <div className="flex justify-center items-center  w-full">
        <Checkbox
          checked={Boolean(allowed)}
          onCheckedChange={isEditable ? onChange : undefined}
          disabled={!isEditable}
          className={
            allowed
              ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              : "border-gray-300"
          }
        />
        {!isEditable ? (
          <Lock className="w-3 h-3 text-muted-foreground ml-1" />
        ) : (
          <div className="w-3 h-3" />
        )}
      </div>
    );
  };

  const isOwnerRole = (role: ProjectRoleDb) => {
    return role.id === "owner" || role.name.toLowerCase() === "owner";
  };

  const setRoleAsDefault = (roleId: string) => {
    setLocalRoles((prev: ProjectRoleDb[]) =>
      prev.map((role) => ({
        ...role,
        is_default: role.id === roleId,
      })),
    );
  };

  const RoleActionButton = ({
    role,
    onEdit,
    onReset,
    canUpdate,
    canDelete,
  }: {
    role: ProjectRoleDb;
    onEdit: () => void;
    onReset: () => void;
    canUpdate: boolean;
    canDelete: boolean;
  }) => {
    const isOwner = isOwnerRole(role);
    const isMember = role.id === "member" || role.name.toLowerCase() === "member";
    const isCoFounder =
      role.name.toLowerCase() === "co-founder" ||
      role.name.toLowerCase() === "cofounder" ||
      role.id === "cofounder" ||
      role.id === "co-founder";

    const canReset = isMember || isCoFounder;
    return (
      <OptionsPopover
        contentClassName="!w-auto"
        trigger={
          <button type="button" className="p-1 rounded hover:bg-muted cursor-pointer">
            <MoreVertical className="w-4 h-4 transition-all duration-200  text-muted-foreground group-hover:text-foreground/60" />
          </button>
        }
        items={[
          {
            label: "Edit",
            icon: Pencil,
            onClick: onEdit,
            disabled: !canUpdate || isOwner,
          },
          {
            label: "Set as default for new members",
            icon: Star,
            onClick: () =>
              canUpdate && !isOwner && !(role.is_default ?? false) && setRoleAsDefault(role.id),
            disabled: !canUpdate || isOwner || (role.is_default ?? false),
          },
          {
            label: "Reset permissions to template",
            icon: RefreshCcw,
            onClick: onReset,
            disabled: !canUpdate || !canReset,
            separator: true,
          },
          {
            label: "Delete role",
            icon: Trash2,
            onClick: () => canDelete && !isOwner && !isMember && handleDeleteRole(role.id),
            disabled: !canDelete || isOwner || isMember,
            accent: true,
          },
        ]}
      />
    );
  };

  // Build TanStack table rows with computed counts
  type RoleRow = {
    id: string;
    role: ProjectRoleDb;
    name: string;
    viewCount: number;
    viewTotal: number;
    createCount: number;
    createTotal: number;
    updateCount: number;
    updateTotal: number;
    deleteCount: number;
    deleteTotal: number;
    notificationCount: number;
    notificationTotal: number;
  };

  const tableData: RoleRow[] = useMemo(() => {
    return filteredRoles.map((role) => {
      const resourcesArr = Object.values(role.permissions || {}) as Record<string, boolean>[];
      const countAllowed = (key: PermissionKey) => resourcesArr.filter((r) => r[key]).length;
      const countPresent = (key: PermissionKey) =>
        resourcesArr.filter((r) => Object.prototype.hasOwnProperty.call(r, key)).length;

      return {
        id: role.id,
        role,
        name: role.name,
        viewCount: countAllowed("view"),
        viewTotal: countPresent("view"),
        createCount: countAllowed("create"),
        createTotal: countPresent("create"),
        updateCount: countAllowed("update"),
        updateTotal: countPresent("update"),
        deleteCount: countAllowed("delete"),
        deleteTotal: countPresent("delete"),
        notificationCount: countAllowed("notification"),
        notificationTotal: countPresent("notification"),
      };
    });
  }, [filteredRoles, localRoles]);

  const columns: ColumnDef<RoleRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => <span>Role</span>,
        cell: ({row}) => {
          const r = row.original.role;
          const isExpanded = !!expandedRoles[r.id];
          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleExpanded(r.id)}
                className="mr-1 p-1 rounded hover:bg-muted cursor-pointer">
                <motion.div animate={{rotate: isExpanded ? 90 : 0}} transition={{duration: 0.2}}>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <ProjectRoleBadge
                color={(r.badge_color ?? undefined) as ProjectRoleBadgeColorKey | undefined}>
                {r.name}
              </ProjectRoleBadge>
              {isOwnerRole(r) ? <Lock className="text-muted-foreground ml-2" size={14} /> : null}
              {(r.is_default ?? false) ? (
                <Star className="text-yellow-500 ml-2 fill-current" size={14} />
              ) : null}
            </div>
          );
        },
        size: 260,
        minSize: 240,
      },
      {
        accessorKey: "view_count",
        header: () => (
          <div className="flex items-center gap-1 leading-none">
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </div>
        ),
        cell: ({row}) => (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {row.original.viewCount}/{row.original.viewTotal}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "create_count",
        header: () => (
          <div className="flex items-center gap-1 leading-none">
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Create</span>
          </div>
        ),
        cell: ({row}) => (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {row.original.createCount}/{row.original.createTotal}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "update_count",
        header: () => (
          <div className="flex items-center gap-1 leading-none">
            <Pencil className="w-3.5 h-3.5" />
            <span>Update</span>
          </div>
        ),
        cell: ({row}) => (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {row.original.updateCount}/{row.original.updateTotal}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "delete_count",
        header: () => (
          <div className="flex items-center gap-1 leading-none">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </div>
        ),
        cell: ({row}) => (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {row.original.deleteCount}/{row.original.deleteTotal}
          </div>
        ),
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: "notification_count",
        header: () => (
          <div className="flex items-center gap-1 leading-none">
            <Bell className="w-3.5 h-3.5" />
            <span>Notification</span>
          </div>
        ),
        cell: ({row}) => (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {row.original.notificationCount}/{row.original.notificationTotal}
          </div>
        ),
        size: 140,
        minSize: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({row}) => {
          const role = row.original.role;
          return (
            <div className="flex justify-center items-center pr-1 group">
              <RoleActionButton
                role={role}
                onEdit={() => {
                  if (!canUpdate) return;
                  setRoleToEdit(role);
                }}
                onReset={() => resetRolePermissions(role.id)}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            </div>
          );
        },
        enableSorting: false,
        size: 50,
        minSize: 50,
        maxSize: 50,
      },
    ],
    [expandedRoles, toggleExpanded, resetRolePermissions, canUpdate, canDelete],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnOrder,
      columnSizing,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: false,
  });

  const skeletonColumns = [
    {
      id: "name",
      header: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
        </div>
      ),
      cell: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ),
      size: 260,
    },
    {
      id: "view",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-12" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-10" />,
      size: 120,
    },
    {
      id: "create",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-14" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-10" />,
      size: 120,
    },
    {
      id: "update",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-14" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-10" />,
      size: 120,
    },
    {
      id: "delete",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-12" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-10" />,
      size: 120,
    },
    {
      id: "notification",
      header: (
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ),
      cell: <Skeleton className="h-4 w-10" />,
      size: 140,
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
          <h4 className="font-medium text-foreground/90 text-lg">Roles and Permissions</h4>
          <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
            {localRoles.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimpleInput
            placeholder="Search..."
            search
            className="max-w-[344px] w-full"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            showClearButton={Boolean(searchQuery)}
            onClear={() => setSearchQuery("")}
          />
          <ColumnViewPopover table={table} hiddenColumnIds={["name", "actions"]} />
          <TableSettingsPopover table={table} setColumnSizing={setColumnSizing} />
          <RoleDialog
            mode="add"
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              if (open && !canCreate) return;
              setIsAddDialogOpen(open);
            }}
            trigger={
              <Button variant="secondary" size="xs" disabled={!canCreate}>
                <PlusIcon className="h-4 w-4" />
                Add Role
              </Button>
            }
            onAddRole={handleAddRole}
            existingRoles={localRoles}
          />
        </div>
      </div>

      {isRolesLoading ? (
        <motion.div
          key="skeleton"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.3, ease: "easeInOut"}}>
          <TableSkeleton columns={skeletonColumns} rowCount={5} />
        </motion.div>
      ) : !roles || roles.length === 0 ? (
        <motion.div
          key="empty"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.3, ease: "easeInOut"}}>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No roles configured.</p>
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
                    table.getRowModel().rows.map((row) => {
                      const role = (row.original as RoleRow).role;
                      const isExpanded = !!expandedRoles[role.id];
                      return [
                        <motion.tr
                          key={`${role.id}-row`}
                          layout="position"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          transition={{duration: 0.2}}
                          className="hover:bg-muted/50 border-b border-border transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "px-2.5 h-[34px] last:border-r-0 py-1 text-left text-foreground border-r border-border",
                              )}
                              style={{width: cell.column.getSize()}}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </motion.tr>,
                        ...(isExpanded && role.permissions
                          ? Object.entries(role.permissions).map(([resourceId, actions]) => (
                              <motion.tr
                                key={`${role.id}-${resourceId}`}
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.2}}
                                className="border-b border-border bg-muted/25">
                                {table.getColumn("name")?.getIsVisible() ? (
                                  <TableCell
                                    className={cn(
                                      "px-2.5 h-[34px] last:border-r-0 py-1 text-left text-foreground border-r border-border",
                                    )}
                                    style={{width: table.getColumn("name")?.getSize()}}>
                                    <div className="flex items-center pl-8">
                                      <span className="text-sm text-foreground">{resourceId}</span>
                                    </div>
                                  </TableCell>
                                ) : null}
                                {PERMISSION_ORDER.map((permType: PermissionKey) => {
                                  const columnId = PERMISSION_COLUMN_IDS[permType];
                                  const column = table.getColumn(columnId);
                                  if (!column || !column.getIsVisible()) return null;
                                  return (
                                    <TableCell
                                      key={`${resourceId}-${permType}`}
                                      className={cn(
                                        "px-2.5 h-[34px] last:border-r-0 py-1 text-center text-foreground border-r border-border",
                                      )}
                                      style={{width: column.getSize()}}>
                                      {(actions as Record<string, boolean>)[permType] !==
                                      undefined ? (
                                        renderPermissionCheckbox(
                                          (actions as Record<string, boolean>)[permType],
                                          !isOwnerRole(role) && !isReadOnly,
                                          () => updatePermission(role.id, resourceId, permType),
                                        )
                                      ) : (
                                        <span className="text-muted-foreground text-xs select-none">
                                          N/A
                                        </span>
                                      )}
                                    </TableCell>
                                  );
                                })}
                                {table.getColumn("actions")?.getIsVisible() ? (
                                  <TableCell
                                    className={cn(
                                      "px-2.5 h-[34px] last:border-r-0 py-1 text-left text-foreground border-r border-border",
                                    )}
                                    style={{
                                      width: table.getColumn("actions")?.getSize(),
                                    }}></TableCell>
                                ) : null}
                              </motion.tr>
                            ))
                          : []),
                      ];
                    })
                  ) : (
                    <motion.tr
                      key="no-results"
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      className="border-b">
                      <TableCell colSpan={7} className="h-24 text-center">
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

      {roleToEdit && (
        <RoleDialog
          mode="edit"
          existingRoles={localRoles}
          roleData={roleToEdit}
          open={Boolean(roleToEdit)}
          onOpenChange={(open) => {
            if (!open) {
              setRoleToEdit(null);
            }
          }}
          onEditRole={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default PermissionManagement;
