"use client";

import React, {useState, useEffect, useMemo, useRef} from "react";
import {isEqual} from "lodash";
import {
  ChevronRight,
  ChevronDown,
  Lock,
  MoreVertical,
  Pencil,
  Palette,
  Copy,
  Star,
  RefreshCcw,
  Trash2,
} from "lucide-react";

// shadcn/ui components
import {Checkbox} from "@/components/shadcn/checkbox";
import {Card, CardContent} from "@/components/shadcn/card";
import {Badge} from "@/components/shadcn/badge";
import {cn} from "@/lib/utils";
import {motion, AnimatePresence} from "framer-motion";

// dropdown menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

// motion variants for fancy dropdown appearance
import {menuVariants, itemDropdownVariants} from "@/utils/other/variants";

// TanStack query hook to fetch roles
import {useProjectRoles} from "@/hooks/query/projects/use-project-roles";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";

// Available permission actions and the order in which we want to display them
type PermissionKey = "view" | "create" | "update" | "delete";
const PERMISSION_ORDER: PermissionKey[] = ["view", "create", "update", "delete"];

interface PermissionManagementProps {
  projectId: string;
  onRolesChange?: (changed: ProjectRoleDb[]) => void;
  resetSignal?: boolean;
}

const PermissionManagement = ({
  projectId,
  onRolesChange,
  resetSignal,
}: PermissionManagementProps) => {
  const {data: roles, isLoading: isRolesLoading} = useProjectRoles(projectId);
  // Keeps track of which roles rows are expanded in the UI
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const originalRolesRef = useRef<ProjectRoleDb[]>([]);

  // Local editable copy of roles. All UI modifications happen here.
  const [localRoles, setLocalRoles] = useState<ProjectRoleDb[]>([]);

  // Keep a copy of roles on first fetch so we can always reset back to it.
  useEffect(() => {
    if (roles) {
      originalRolesRef.current = roles;
      setLocalRoles(roles);
    }
  }, [roles]);

  // Reset back to original data when parent toggles the signal.
  useEffect(() => {
    setLocalRoles(originalRolesRef.current);
  }, [resetSignal]);

  // Calculate which roles have changed compared with the original dataset and
  // notify parent component so it can enable / disable the Save button.
  useEffect(() => {
    if (!onRolesChange) return;

    const changed = localRoles.filter((role) => {
      const original = originalRolesRef.current.find((r) => r.id === role.id);
      return !isEqual(role, original);
    });

    onRolesChange(changed);
  }, [localRoles, onRolesChange]);

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

  // Expand the owner role on first load
  useEffect(() => {
    if (roles && Object.keys(expandedRoles).length === 0) {
      const ownerRole = roles.find((r) => r.id === "owner" || r.name.toLowerCase() === "owner");
      if (ownerRole) {
        setExpandedRoles({[ownerRole.id]: true});
      }
    }
  }, [roles]);

  if (isRolesLoading) {
    return <div>Loading roles…</div>;
  }

  if (!roles || roles.length === 0) {
    return <div>No roles configured.</div>;
  }

  const toggleExpanded = (roleId: string) => {
    setExpandedRoles((prev: Record<string, boolean>) => ({...prev, [roleId]: !prev[roleId]}));
  };

  const updatePermission = (roleId: string, resourceId: string, permissionType: PermissionKey) => {
    setLocalRoles((prev: ProjectRoleDb[]) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;

        // Defensive: clone permissions object so we never mutate state directly.
        const updatedPermissions = {...(role.permissions || {})};
        const resourcePermissions = {...(updatedPermissions[resourceId] || {})};

        resourcePermissions[permissionType] = !resourcePermissions[permissionType];
        updatedPermissions[resourceId] = resourcePermissions;

        return {
          ...role,
          permissions: updatedPermissions,
        };
      }),
    );
  };

  const getRoleBadgeColor = (role: ProjectRoleDb) => {
    const colorMap = {
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      red: "bg-red-100 text-red-800 hover:bg-red-100",
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      green: "bg-green-100 text-green-800 hover:bg-green-100",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      pink: "bg-pink-100 text-pink-800 hover:bg-pink-100",
      indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    };
    return colorMap[role.badge_color as keyof typeof colorMap] || colorMap.gray;
  };

  const renderPermissionCheckbox = (
    allowed: boolean | undefined,
    isEditable: boolean,
    onChange: () => void,
  ) => {
    return (
      <div className="flex justify-center items-center">
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
        {!isEditable && <Lock className="w-3 h-3 text-muted-foreground ml-1" />}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Role actions pop-over
  // ─────────────────────────────────────────────
  const RoleActionButton = ({role}: {role: ProjectRoleDb}) => {
    const locked = role.id === "owner" || role.id === "member"; // cannot rename/delete

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="p-1 rounded hover:bg-muted cursor-pointer">
            <MoreVertical className="w-4 h-4 transition-all duration-200  text-muted-foreground group-hover:text-foreground/60" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent asChild side="bottom" align="end" sideOffset={4}>
          <motion.div
            initial="closed"
            animate="open"
            variants={menuVariants}
            className="space-y-2 rounded-lg min-w-[200px]">
            {/* Primary actions */}
            <DropdownMenuGroup>
              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem disabled={locked} className="cursor-pointer">
                  <Pencil size={16} className="opacity-60 mr-2" />
                  Rename role
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem className="cursor-pointer">
                  <Palette size={16} className="opacity-60 mr-2" />
                  Change badge color
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={Boolean(role.is_system_role)}
                  className="cursor-pointer">
                  <Copy size={16} className="opacity-60 mr-2" />
                  Duplicate role
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={Boolean(role.is_system_role) || role.id === "owner"}
                  className="cursor-pointer">
                  <Star size={16} className="opacity-60 mr-2" />
                  Set as default for new members
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Secondary actions */}
            <DropdownMenuGroup>
              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={Boolean(role.is_system_role)}
                  className="cursor-pointer">
                  <RefreshCcw size={16} className="opacity-60 mr-2" />
                  Reset permissions to template
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={locked || Boolean(role.is_system_role)}
                  className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 size={16} className="opacity-60 mr-2" />
                  Delete role
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuGroup>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  /**
   * Single role + nested resources row
   */
  const renderRoleRow = (role: ProjectRoleDb) => {
    const resourcesArr = Object.values(role.permissions || {}) as Record<string, boolean>[];

    const countAllowed = (key: PermissionKey) => resourcesArr.filter((r) => r[key]).length;
    const countPresent = (key: PermissionKey) =>
      resourcesArr.filter((r) => Object.prototype.hasOwnProperty.call(r, key)).length;

    const viewCount = countAllowed("view");
    const viewTotal = countPresent("view");

    const createCount = countAllowed("create");
    const createTotal = countPresent("create");

    const updateCount = countAllowed("update");
    const updateTotal = countPresent("update");

    const deleteCount = countAllowed("delete");
    const deleteTotal = countPresent("delete");

    return (
      <div key={role.id}>
        <div
          className="grid gap-4 py-3  hover:bg-muted/50"
          style={{gridTemplateColumns: "repeat(5, minmax(0, 1fr)) 50px"}}>
          <div className="flex items-center pl-4">
            <button
              type="button"
              onClick={() => toggleExpanded(role.id)}
              className="mr-2 p-1 rounded hover:bg-muted cursor-pointer">
              {expandedRoles[role.id] ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <Badge variant="secondary" className={getRoleBadgeColor(role)}>
              {role.name}
            </Badge>
            {role.is_system_role ? <Lock className="text-muted-foreground ml-2" size={14} /> : null}
          </div>
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {viewCount}/{viewTotal}
          </div>
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {createCount}/{createTotal}
          </div>
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {updateCount}/{updateTotal}
          </div>
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {deleteCount}/{deleteTotal}
          </div>
          {/* Action column */}
          <div className="flex justify-center items-center pr-4  group">
            <RoleActionButton role={role} />
          </div>
        </div>

        {/* animation wrapper */}
        <AnimatePresence initial={false}>
          {expandedRoles[role.id] && (
            <motion.div
              key="resources"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: {opacity: 1, height: "auto"},
                collapsed: {opacity: 0, height: 0},
              }}
              transition={{duration: 0.25, ease: "easeInOut"}}
              style={{overflow: "hidden"}}>
              {role.permissions
                ? Object.entries(role.permissions).map(([resourceId, actions]) => (
                    <div
                      key={resourceId}
                      className="grid gap-4 py-2 hover:bg-muted/25"
                      style={{gridTemplateColumns: "repeat(5, minmax(0, 1fr)) 50px"}}>
                      <div className="flex items-center pl-12">
                        <span className="text-sm text-foreground">{resourceId}</span>
                      </div>
                      {PERMISSION_ORDER.map((permType) => (
                        <div key={permType} className="flex justify-center items-center">
                          {actions[permType] !== undefined ? (
                            renderPermissionCheckbox(actions[permType], !role.is_system_role, () =>
                              updatePermission(role.id, resourceId, permType),
                            )
                          ) : (
                            <span className="text-muted-foreground text-xs select-none">N/A</span>
                          )}
                        </div>
                      ))}
                      {/* empty cell to align with action column */}
                      <div />
                    </div>
                  ))
                : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const columnsNames = [
    {
      label: "Permissions",
      isMain: true,
    },
    {
      label: "View",
    },
    {
      label: "Create",
    },
    {
      label: "Update",
    },
    {
      label: "Delete",
    },
    {
      label: " ", // empty header for actions column
    },
  ];

  return (
    <div className="w-full mx-auto space-y-6">
      <Card className="shadow-none">
        <CardContent className="p-0">
          {/* Scrollable container with gradient fade overlays */}
          <div className="relative">
            {/* <div className="pointer-events-none absolute top-[45px] left-0 w-full h-6 bg-gradient-to-b from-muted-header via-muted-header/70 to-transparent" /> */}
            {/* <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-card via-card/70 to-transparent" /> */}

            {/* Fixed-height scrollable area */}
            <div
              className="max-h-[480px] overflow-y-auto flex flex-col rounded-t-[8px]"
              style={{scrollbarGutter: "stable"}}>
              {/* Sticky header */}
              <div
                className="grid gap-4 py-3 px-4 bg-muted-header border-b border-border sticky top-0 z-10"
                style={{gridTemplateColumns: "repeat(5, minmax(0, 1fr)) 50px"}}>
                {/* Column headers */}
                {columnsNames.map((column) => (
                  <div
                    key={column.label}
                    className={cn(
                      "text-sm font-medium text-foreground/90",
                      !column.isMain && "text-center",
                    )}>
                    {column.label}
                  </div>
                ))}
              </div>

              {/* Scrollable body */}
              <div className="flex-1 divide-y divide-border">
                {sortedRoles.map((role) => renderRoleRow(role))}
              </div>
            </div>
            {/* end scrollable area */}
          </div>
          {/* end relative container */}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagement;
