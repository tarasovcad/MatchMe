import React from "react";
import {Badge} from "@/components/shadcn/badge";
import {cn} from "@/lib/utils";

const colorClasses = {
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  red: "bg-red-100 text-red-800 hover:bg-red-100",
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  green: "bg-green-100 text-green-800 hover:bg-green-100",
  yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  pink: "bg-pink-100 text-pink-800 hover:bg-pink-100",
  indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  gray: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  cyan: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
} as const;

export type ProjectRoleBadgeColorKey = keyof typeof colorClasses;

export interface ProjectRoleBadgeProps extends React.ComponentProps<typeof Badge> {
  color?: ProjectRoleBadgeColorKey;
}

const ProjectRoleBadge = React.forwardRef<HTMLSpanElement, ProjectRoleBadgeProps>(
  ({color = "gray", className, variant = "secondary", ...props}, ref) => {
    return (
      <Badge
        ref={ref}
        variant={variant}
        className={cn(colorClasses[color] ?? colorClasses.gray, className)}
        {...props}
      />
    );
  },
);

ProjectRoleBadge.displayName = "ProjectRoleBadge";

export default ProjectRoleBadge;
