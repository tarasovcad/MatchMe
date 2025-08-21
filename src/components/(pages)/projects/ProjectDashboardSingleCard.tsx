import {Button} from "@/components/shadcn/button";
import {Project} from "@/types/projects/projects";
import {ArrowRight, EllipsisVertical} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProjectDashboardSingleCard = ({project}: {project: Project}) => {
  return (
    <div className="p-4.5 rounded-[12px] border border-border/80 ">
      <div className="mb-4.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {project.project_image && project.project_image.length > 0 && (
            <div className="w-[45px] h-[45px] border border-border rounded-[6px] p-[5px] flex items-center justify-center">
              <Image
                src={project.project_image[0].url}
                alt={`${project.name} profile picture`}
                width={30}
                height={30}
                className="rounded-[3px] object-cover shrink-0 w-[30px] h-[30px]"
                unoptimized
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Link href={`/dashboard/projects/${project.slug}`} className="group">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-[18px] leading-[20px] text-foreground/80 line-clamp-1 group-hover:text-foreground/90 transition-all duration-300">
                  {project.name}
                </h4>
                <ArrowRight
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="text-foreground/80 group-hover:text-foreground/100 transition-all duration-300 group-hover:translate-x-1"
                />
              </div>
            </Link>
            <p className="text-[14px] text-foreground/60 line-clamp-2 leading-[16px]">
              {project.category} &nbsp;•&nbsp; 5 members &nbsp;•&nbsp; {project.current_stage}{" "}
              &nbsp;•&nbsp; {project.technology_stack.slice(0, 4).join(", ")}
            </p>
          </div>
        </div>
        <div>
          <Button size={"icon"} className="border-none shadow-none">
            <EllipsisVertical size="16" color="currentColor" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default ProjectDashboardSingleCard;
