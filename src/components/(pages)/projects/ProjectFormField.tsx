import {ProjectFormFieldProps} from "@/data/forms/projects/projectFormFields";
import React from "react";
import ExpandedDescription from "../profiles/ExpandedDescription";
import TagsList from "../profiles/TagsList";
import ProjectDetails from "./ProjectDetails";
import {Project} from "@/types/projects/projects";

const TextComponent = ({project, id}: {project: Project; id: string}) => {
  const content = project[id as keyof Project] as string;
  return <p className="text-muted-foreground text-sm">{content}</p>;
};

const fieldComponents = {
  description: ExpandedDescription,
  text: TextComponent,
  skills: TagsList,
  details: ProjectDetails,
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
  const {fieldTitle, fieldDescription, fieldType} = formField;

  const InputComponent = fieldComponents[fieldType as keyof typeof fieldComponents];

  return (
    <div className="flex max-[990px]:flex-col justify-between items-start gap-8 max-[990px]:gap-3">
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">{fieldTitle}</p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">{fieldDescription}</p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px]">
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
