"use client";
import {ProjectFormFieldProps} from "@/data/forms/projects/projectFormFields";
import React from "react";
import ExpandedDescription from "../profiles/ExpandedDescription";
import TagsList from "../profiles/TagsList";
import ProjectDetails from "./ProjectDetails";
import {Project} from "@/types/projects/projects";
import ProjectOpenPositions from "./ProjectOpenPositions";
import {projectDetailsSections} from "@/data/forms/projects/projectFormFields";

const TextComponent = ({project, id}: {project: Project; id: string}) => {
  const content = project[id as keyof Project] as string;
  return <p className="text-muted-foreground text-sm">{content}</p>;
};

const fieldComponents = {
  description: ExpandedDescription,
  text: TextComponent,
  skills: TagsList,
  details: ProjectDetails,
  open_positions: ProjectOpenPositions,
};

const isNonEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
};

const hasFieldContent = (
  project: Project,
  formField: ProjectFormFieldProps,
  skills: {name: string; image_url: string}[],
): boolean => {
  const {fieldType, fieldInputProps} = formField;

  const getValuesToCheck = (): unknown[] => {
    switch (fieldType) {
      case "details": {
        const sectionId = fieldInputProps?.[0]?.id;
        const section = projectDetailsSections.find((s) => s.id === sectionId);
        if (!section) return [];
        return section.fields.map(({value}) => project[value as keyof Project]);
      }
      case "skills":
        return [skills];
      case "text":
      case "description": {
        const key = fieldInputProps?.[0]?.id as keyof Project | undefined;
        return key ? [project[key]] : [];
      }
      default:
        return [];
    }
  };

  const values = getValuesToCheck();
  return values.some(isNonEmpty);
};

const ProjectFormField = ({
  formField,
  project,
  skills,
}: {
  formField: ProjectFormFieldProps;
  project: Project;
  skills: {
    name: string;
    image_url: string;
  }[];
}) => {
  const {fieldTitle, fieldDescription, fieldType, layout = "row", columnIfCharsAtLeast} = formField;

  if (!hasFieldContent(project, formField, skills)) {
    return null;
  }

  const InputComponent = fieldComponents[fieldType as keyof typeof fieldComponents];

  let isColumnLayout = layout === "column";
  if ((fieldType === "text" || fieldType === "description") && columnIfCharsAtLeast) {
    const key = formField.fieldInputProps?.[0]?.id as keyof Project | undefined;
    const raw = key ? (project[key] as unknown) : undefined;
    const length = typeof raw === "string" ? raw.trim().length : 0;
    if (length >= columnIfCharsAtLeast) {
      isColumnLayout = true;
    }
  }

  return (
    <div
      className={`flex ${isColumnLayout ? "flex-col" : "max-[990px]:flex-col"} justify-between items-start ${isColumnLayout ? "gap-3" : "gap-8 max-[990px]:gap-3"}`}>
      <div className={`flex flex-col gap-[1px] w-full ${isColumnLayout ? "" : "max-w-[285px]"}`}>
        <p className="font-medium text-foreground text-sm">{fieldTitle}</p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">{fieldDescription}</p>
        )}
      </div>
      <div className={`w-full ${isColumnLayout ? "" : "min-[990px]:max-w-[652px]"}`}>
        <InputComponent
          project={project}
          id={formField.fieldInputProps?.[0]?.id ?? ""}
          maxNmberOfLines={formField.fieldInputProps?.[0]?.maxNmberOfLines ?? 0}
          skills={skills}
        />
      </div>
    </div>
  );
};

export default ProjectFormField;
