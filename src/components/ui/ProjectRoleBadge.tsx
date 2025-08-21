import React from "react";
import {Badge} from "@/components/shadcn/badge";
import {cn} from "@/lib/utils";

const colorClasses = {
  purple: "bg-[#EDE9FE] text-[#5B21B6]",
  red: "bg-[#FEE2E2] text-[#991B1B]",
  blue: "bg-[#D6E4EE] text-[#10578A]",
  green: "bg-[#DCFCE7] text-[#166534]",
  yellow: "bg-[#FEF3C7] text-[#92400E]",
  orange: "bg-[#F5DFCC] text-[#713400]",
  pink: "bg-[#F1E1E9] text-[#941956]",
  indigo: "bg-[#E0E7FF] text-[#3730A3]",
  gray: "bg-[#F3F4F6] text-[#374151]",
  cyan: "bg-[#CFFAFE] text-[#155E75]",
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
