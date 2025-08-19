"use client";
import {projectDetailsSections} from "@/data/forms/projects/projectFormFields";
import {Project} from "@/types/projects/projects";
import {ArrowUpRight} from "lucide-react";
import Link from "next/link";
import React, {JSX} from "react";

import {projectStages} from "@/data/projects/projectStages";
import {collaborationModels} from "@/data/projects/collaborationModels";
import {compensationModels} from "@/data/projects/compensationModels";
import {fundingInvestment} from "@/data/projects/fundingInvestment";
import {revenueExpectations} from "@/data/projects/revenueExpectations";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {expectedTimelineOptions} from "@/data/projects/expectedTimelineOptions";
import {collaborationStyles} from "@/data/projects/collaborationStyles";
import {experienceLevels} from "@/data/projects/experienceLevels";

const enumMappings: Record<string, Array<{title: string; value: string}>> = {
  current_stage: projectStages,
  collaboration_model: collaborationModels,
  compensation_model: compensationModels,
  funding_investment: fundingInvestment,
  revenue_expectations: revenueExpectations,
  time_commitment: timeCommitment,
  expected_timeline: expectedTimelineOptions,
  collaboration_style: collaborationStyles,
  experience_level: experienceLevels,
};

const getEnumDisplayValue = (key: string, value: string): string => {
  const enumData = enumMappings[key];
  if (enumData && value) {
    const found = enumData.find((item) => item.value === value);
    return found?.title ?? value;
  }
  return value;
};

const displayProjectValue = (
  key: string,
  value: string | number | boolean | string[] | null,
): JSX.Element | string => {
  if (!value) return "";

  switch (key) {
    case "skills":
    case "language_proficiency":
    case "community_platforms":
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
    default: {
      const displayValue = getEnumDisplayValue(key, String(value));
      return <p className="text-[14px] text-foreground">{displayValue}</p>;
    }
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
