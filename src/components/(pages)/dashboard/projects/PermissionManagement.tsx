"use client";

import React, {useState} from "react";
import {
  ChevronRight,
  ChevronDown,
  Minus,
  Lock,
  Users,
  Shield,
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
import {Card, CardContent, CardHeader, CardTitle} from "@/components/shadcn/card";
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

type PermissionState = "granted" | "denied" | "partial";

interface ResourcePermission {
  id: string;
  name: string;
  /**
   * Each resource can expose only the permission actions it actually supports.
   * If an action key is omitted (e.g. no `create` for the `analytics` resource),
   * the UI will simply skip rendering a checkbox for it.
   */
  permissions: Partial<Record<PermissionKey, PermissionState>>;
}

interface Role {
  id: string;
  name: string;
  badgeColor: string;
  isExpanded?: boolean;
  isEditable: boolean;
  resources: ResourcePermission[];
}

// Available permission actions and the order in which we want to display them
type PermissionKey = "view" | "create" | "update" | "delete";
const PERMISSION_ORDER: PermissionKey[] = ["view", "create", "update", "delete"];

const PermissionManagement = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "owner",
      name: "Owner",
      isExpanded: true,
      isEditable: false,
      badgeColor: "purple",
      resources: [
        {
          id: "project-details",
          name: "Project Details",
          permissions: {view: "granted", update: "granted"},
        },
        {
          id: "members",
          name: "Members",
          permissions: {view: "granted", update: "granted", delete: "granted"},
        },
        {
          id: "invitations",
          name: "Invitations",
          permissions: {view: "granted", create: "granted", delete: "granted"},
        },
        {
          id: "open-positions",
          name: "Open Positions",
          permissions: {view: "granted", create: "granted", update: "granted", delete: "granted"},
        },
        {
          id: "applications",
          name: "Applications",
          permissions: {view: "granted", create: "granted", update: "granted", delete: "granted"},
        },
        {
          id: "analytics",
          name: "Analytics",
          permissions: {view: "granted"},
        },
        {
          id: "followers",
          name: "Followers",
          permissions: {view: "granted"},
        },
      ],
    },
    {
      id: "member",
      name: "Member",
      badgeColor: "green",
      isExpanded: false,
      isEditable: true,
      resources: [
        {
          id: "project-details",
          name: "Project Details",
          permissions: {view: "granted", update: "denied"},
        },
        {
          id: "members",
          name: "Members",
          permissions: {view: "granted", update: "denied", delete: "denied"},
        },
        {
          id: "invitations",
          name: "Invitations",
          permissions: {view: "granted", create: "denied", delete: "denied"},
        },
        {
          id: "open-positions",
          name: "Open Positions",
          permissions: {view: "granted", create: "denied", update: "denied", delete: "denied"},
        },
        {
          id: "applications",
          name: "Applications",
          permissions: {view: "granted", create: "granted", update: "denied", delete: "denied"},
        },
        {
          id: "analytics",
          name: "Analytics",
          permissions: {view: "denied"},
        },
        {
          id: "followers",
          name: "Followers",
          permissions: {view: "granted"},
        },
      ],
    },
  ]);

  const toggleExpanded = (roleId: string) => {
    setRoles((prev) =>
      prev.map((role) => (role.id === roleId ? {...role, isExpanded: !role.isExpanded} : role)),
    );
  };

  const updatePermission = (roleId: string, resourceId: string, permissionType: PermissionKey) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role?.isEditable) return;

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          return {
            ...r,
            resources: r.resources.map((resource) => {
              if (resource.id === resourceId) {
                // If the permission key isn't present for this resource, ignore the toggle.
                if (resource.permissions[permissionType] === undefined) return resource;

                const currentState = resource.permissions[permissionType] as PermissionState;
                const newState: PermissionState = currentState === "granted" ? "denied" : "granted";
                return {
                  ...resource,
                  permissions: {
                    ...resource.permissions,
                    [permissionType]: newState,
                  },
                };
              }
              return resource;
            }),
          };
        }
        return r;
      }),
    );
  };

  const changeBadgeColor = (roleId: string) => {
    const colors = ["purple", "red", "blue", "green", "yellow", "orange", "pink", "indigo", "gray"];
    const currentRole = roles.find((r) => r.id === roleId);
    if (!currentRole) return;

    const currentColorIndex = colors.indexOf(currentRole.badgeColor);
    const nextColorIndex = (currentColorIndex + 1) % colors.length;
    const nextColor = colors[nextColorIndex];

    setRoles((prev) =>
      prev.map((role) => (role.id === roleId ? {...role, badgeColor: nextColor} : role)),
    );
  };

  const getRoleBadgeColor = (role: Role) => {
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

    return colorMap[role.badgeColor as keyof typeof colorMap] || colorMap.gray;
  };

  const renderPermissionCheckbox = (
    state: PermissionState,
    isEditable: boolean,
    onChange: () => void,
  ) => {
    if (state === "granted") {
      return (
        <div className="flex justify-center items-center">
          <Checkbox
            checked
            onCheckedChange={isEditable ? onChange : undefined}
            disabled={!isEditable}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          {!isEditable && <Lock className="w-3 h-3 text-muted-foreground ml-1" />}
        </div>
      );
    }

    if (state === "partial") {
      return (
        <div className="flex justify-center items-center">
          <div
            className={`w-4 h-4 bg-primary rounded-[8px] flex items-center justify-center ${
              isEditable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            }`}
            onClick={isEditable ? onChange : undefined}>
            <Minus className="w-3 h-3 text-white" />
          </div>
          {!isEditable && <Lock className="w-3 h-3 text-muted-foreground ml-1" />}
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center">
        <Checkbox
          checked={false}
          onCheckedChange={isEditable ? onChange : undefined}
          disabled={!isEditable}
          className="border-gray-300"
        />
        {!isEditable && <Lock className="w-3 h-3 text-muted-foreground ml-1" />}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Role actions pop-over (3-dots button)
  // ─────────────────────────────────────────────
  const RoleActionButton = ({role}: {role: Role}) => {
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
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => changeBadgeColor(role.id)}>
                  <Palette size={16} className="opacity-60 mr-2" />
                  Change badge color
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem disabled={!role.isEditable} className="cursor-pointer">
                  <Copy size={16} className="opacity-60 mr-2" />
                  Duplicate role
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={!role.isEditable || role.id === "owner"}
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
                <DropdownMenuItem disabled={!role.isEditable} className="cursor-pointer">
                  <RefreshCcw size={16} className="opacity-60 mr-2" />
                  Reset permissions to template
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemDropdownVariants}>
                <DropdownMenuItem
                  disabled={locked || !role.isEditable}
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
  const renderRoleRow = (role: Role) => (
    <div key={role.id}>
      <div
        className="grid gap-4 py-3  hover:bg-muted/50"
        style={{gridTemplateColumns: "repeat(5, minmax(0, 1fr)) 50px"}}>
        <div className="flex items-center pl-4">
          <button
            type="button"
            onClick={() => toggleExpanded(role.id)}
            className="mr-2 p-1 rounded hover:bg-muted cursor-pointer">
            {role.isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <Badge variant="secondary" className={getRoleBadgeColor(role)}>
            {role.name}
          </Badge>
          {!role.isEditable && <Lock className="text-muted-foreground ml-2" size={14} />}
        </div>
        <div className="flex justify-center items-center text-sm text-muted-foreground">
          {role.resources.filter((r) => r.permissions.view === "granted").length}/
          {role.resources.length}
        </div>
        <div className="flex justify-center items-center text-sm text-muted-foreground">
          {role.resources.filter((r) => r.permissions.create === "granted").length}/
          {role.resources.length}
        </div>
        <div className="flex justify-center items-center text-sm text-muted-foreground">
          {role.resources.filter((r) => r.permissions.update === "granted").length}/
          {role.resources.length}
        </div>
        <div className="flex justify-center items-center text-sm text-muted-foreground">
          {role.resources.filter((r) => r.permissions.delete === "granted").length}/
          {role.resources.length}
        </div>
        {/* Action column */}
        <div className="flex justify-center items-center pr-4  group">
          <RoleActionButton role={role} />
        </div>
      </div>

      {/* animation wrapper */}
      <AnimatePresence initial={false}>
        {role.isExpanded && (
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
            {role.resources.map((resource) => (
              <div
                key={resource.id}
                className="grid gap-4 py-2 hover:bg-muted/25"
                style={{gridTemplateColumns: "repeat(5, minmax(0, 1fr)) 50px"}}>
                <div className="flex items-center pl-12">
                  <span className="text-sm text-foreground">{resource.name}</span>
                </div>
                {PERMISSION_ORDER.map((permType) => (
                  <div key={permType} className="flex justify-center items-center">
                    {resource.permissions[permType] !== undefined ? (
                      renderPermissionCheckbox(
                        resource.permissions[permType] as PermissionState,
                        role.isEditable,
                        () => updatePermission(role.id, resource.id, permType),
                      )
                    ) : (
                      <span className="text-muted-foreground text-xs select-none">N/A</span>
                    )}
                  </div>
                ))}
                {/* empty cell to align with action column */}
                <div />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

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
                {roles.map((role) => renderRoleRow(role))}
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
