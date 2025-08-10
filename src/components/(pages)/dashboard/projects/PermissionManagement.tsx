"use client";

import React, {useState, useEffect, useMemo, useRef} from "react";
import {isEqual} from "lodash";
import {
  ChevronRight,
  Lock,
  MoreVertical,
  Pencil,
  Palette,
  Copy,
  Star,
  RefreshCcw,
  Trash2,
  PlusIcon,
} from "lucide-react";

// shadcn/ui components
import {Checkbox} from "@/components/shadcn/checkbox";
import {Card, CardContent} from "@/components/shadcn/card";
import {Button} from "@/components/shadcn/button";
import RoleDialog, {AddRoleFormData} from "./RoleDialog";
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
import type {UpdatableRole} from "@/actions/projects/updateProjectRoles";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {
  createDefaultPermissions,
  memberPermissions,
  coFounderPermissions,
} from "@/data/projects/defaultProjectRoles";
import ProjectRoleBadge, {ProjectRoleBadgeColorKey} from "@/components/ui/ProjectRoleBadge";

// Available permission actions and the order in which we want to display them
type PermissionKey = "view" | "create" | "update" | "delete" | "notification";
const PERMISSION_ORDER: PermissionKey[] = ["view", "create", "update", "delete", "notification"];

interface PermissionManagementProps {
  projectId: string;
  onRolesChange?: (changed: UpdatableRole[]) => void;
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
  // Track deleted role ids to include them in the change set sent upwards
  const deletedRoleIdsRef = useRef<Set<string>>(new Set());

  // Track role currently being edited
  const [roleToEdit, setRoleToEdit] = useState<ProjectRoleDb | null>(null);

  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    if (!onRolesChange) return;

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

    onRolesChange([...changedOrNew, ...deletedRoles]);
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

  // Reset role permissions back to template defaults for Member or Co-Founder roles
  const resetRolePermissions = (roleId: string) => {
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
  }: {
    role: ProjectRoleDb;
    onEdit: () => void;
    onReset: () => void;
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
                <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                  <Pencil size={16} className="opacity-60 mr-2" />
                  Edit
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={isOwner}
                  onClick={() =>
                    !isOwner && !(role.is_default ?? false) && setRoleAsDefault(role.id)
                  }>
                  {role.is_default ? (
                    <>
                      <Star size={16} className="opacity-60 mr-2 text-yellow-500 fill-current " />
                      Default role for new members
                    </>
                  ) : (
                    <>
                      <Star size={16} className="opacity-60 mr-2" />
                      Set as default for new members
                    </>
                  )}
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={!canReset}
                  className="cursor-pointer"
                  onClick={() => canReset && onReset()}>
                  <RefreshCcw size={16} className="opacity-60 mr-2" />
                  Reset permissions to template
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={isOwner || isMember}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => !isOwner && !isMember && handleDeleteRole(role.id)}>
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

  // Animation variants for role rows
  const roleRowVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
    },
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

    const notificationCount = countAllowed("notification");
    const notificationTotal = countPresent("notification");

    return (
      <motion.div
        key={role.id}
        layout
        variants={roleRowVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          layout: {duration: 0.2},
        }}
        style={{overflow: "hidden"}}>
        <div
          className="grid gap-4 py-3  hover:bg-muted/50"
          style={{gridTemplateColumns: "repeat(6, minmax(0, 1fr)) 50px"}}>
          <div className="flex items-center pl-4">
            <button
              type="button"
              onClick={() => toggleExpanded(role.id)}
              className="mr-2 p-1 rounded hover:bg-muted cursor-pointer">
              <motion.div
                animate={{rotate: expandedRoles[role.id] ? 90 : 0}}
                transition={{duration: 0.2, ease: "easeInOut"}}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            <ProjectRoleBadge
              color={(role.badge_color ?? undefined) as ProjectRoleBadgeColorKey | undefined}>
              {role.name}
            </ProjectRoleBadge>
            {isOwnerRole(role) ? <Lock className="text-muted-foreground ml-2" size={14} /> : null}
            {(role.is_default ?? false) ? (
              <Star className="text-yellow-500 ml-2 fill-current" size={14} />
            ) : null}
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
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            {notificationCount}/{notificationTotal}
          </div>
          {/* Action column */}
          <div className="flex justify-center items-center pr-4  group">
            <RoleActionButton
              role={role}
              onEdit={() => setRoleToEdit(role)}
              onReset={() => resetRolePermissions(role.id)}
            />
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
                      style={{gridTemplateColumns: "repeat(6, minmax(0, 1fr)) 50px"}}>
                      <div className="flex items-center pl-12">
                        <span className="text-sm text-foreground">{resourceId}</span>
                      </div>
                      {PERMISSION_ORDER.map((permType) => (
                        <div key={permType} className="flex justify-center items-center">
                          {actions[permType] !== undefined ? (
                            renderPermissionCheckbox(actions[permType], !isOwnerRole(role), () =>
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
      </motion.div>
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
      label: "Notification",
    },
    {
      label: " ", // empty header for actions column
    },
  ];

  return (
    <>
      <div className="w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-foreground text-xl">Roles and Permissions</h4>
          <div className="flex items-center gap-2">
            <SimpleInput
              placeholder="Search for a role"
              search
              className="max-w-[344px] w-full"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showClearButton={Boolean(searchQuery)}
              onClear={() => setSearchQuery("")}
            />
            <RoleDialog
              mode="add"
              trigger={
                <Button variant="secondary" size="xs">
                  <PlusIcon className="w-4 h-4" />
                  Add Role
                </Button>
              }
              onAddRole={handleAddRole}
              existingRoles={localRoles}
            />
          </div>
        </div>

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
                  style={{gridTemplateColumns: "repeat(6, minmax(0, 1fr)) 50px"}}>
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
                  <AnimatePresence mode="popLayout">
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => renderRoleRow(role))
                    ) : searchQuery.trim() ? (
                      <motion.div
                        key="no-results"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3, ease: "easeInOut"}}
                        className="flex flex-col items-center justify-center py-10  px-4 text-center">
                        <h3 className="text-lg font-medium text-foreground mb-2">No roles found</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                          No roles match &ldquo;{searchQuery}&rdquo;. Try adjusting your search or{" "}
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-primary hover:underline font-medium">
                            clear the search
                          </button>{" "}
                          to see all roles.
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              {/* end scrollable area */}
            </div>
            {/* end relative container */}
          </CardContent>
        </Card>
      </div>
      {roleToEdit && (
        <RoleDialog
          mode="edit"
          existingRoles={localRoles}
          roleData={roleToEdit}
          open={Boolean(roleToEdit)}
          onOpenChange={(open) => {
            if (!open) setRoleToEdit(null);
          }}
          onEditRole={handleUpdateRole}
        />
      )}
    </>
  );
};

export default PermissionManagement;
