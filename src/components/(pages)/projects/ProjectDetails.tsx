"use client";
import {projectDetailsSections} from "@/data/forms/projects/projectFormFields";
import {Project} from "@/types/projects/projects";
import {ArrowUpRight} from "lucide-react";
import Link from "next/link";
import React, {JSX} from "react";

// Project type for display purposes with dynamic field access
interface ProjectDisplay {
  [key: string]: string | number | boolean | string[] | null;
}

const displayProjectValue = (
  key: string,
  value: string | number | boolean | string[] | null,
): JSX.Element | string => {
  if (!value) return "";

  switch (key) {
    case "skills":
    case "communication_tools":
      return (
        <p className="text-[14px] text-foreground">
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </p>
      );
    case "project_website":
    case "repository_url":
      return (
        <Link href={String(value)} className="group flex items-center gap-[3px]">
          <p className="text-[14px] text-foreground group-hover:underline underline-offset-4 transition-all">
            {typeof value === "string" ? value.replace(/^[a-zA-Z]+:\/\//, "") : String(value)}
          </p>
          <ArrowUpRight
            size={16}
            className="group-hover:rotate-12 transition-transform duration-200"
          />
        </Link>
      );
    case "working_hours":
      return <p className="text-[14px] text-foreground">{`${value} hours / week`}</p>;
    case "compensation_model":
      return <p className="text-[14px] text-foreground capitalize">{String(value)}</p>;
    default:
      return <p className="text-[14px] text-foreground">{String(value)}</p>;
  }
};

const ProjectDetails = ({project, id}: {project: Project; id?: string}) => {
  // If id is provided, filter to show only that section
  const sectionsToShow = id
    ? projectDetailsSections.filter((section) => section.id === id)
    : projectDetailsSections;

  return (
    <div className="space-y-8">
      {sectionsToShow.map((section) => (
        <div key={section.id} className="">
          {/* Section Fields - no header when showing single section */}
          <div className="gap-4 grid grid-cols-3 max-[1100px]:grid-cols-2 max-[450px]:grid-cols-1">
            {section.fields.map(({title, value}) => {
              const rawValue = project[value as keyof Project] as
                | string
                | number
                | boolean
                | string[]
                | null;

              // Only render if the field has a value
              if (!rawValue) return null;

              return (
                <div key={value} className="">
                  <p className="text-muted-foreground text-xs break-words">{title}</p>
                  {displayProjectValue(value, rawValue)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectDetails;
