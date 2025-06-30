import {Badge} from "@/components/shadcn/badge";
import {Hash} from "lucide-react";
import Link from "next/link";
import React from "react";

const tags = ["ai", "healcare", "cancer-research", "social-media"];

const ProjectTagsSection = () => {
  return (
    <div className={`flex flex-col justify-between pt-15 items-start gap-3`}>
      <div className={`flex flex-col gap-[1px] w-full`}>
        <p className="font-medium text-foreground text-base">Categories:</p>
      </div>
      <div className="w-full flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            className="cursor-pointer group "
            href={`/projects?tag=${tag.toLowerCase()}`}>
            <Badge
              variant="outline"
              className="text-foreground/60 bg-[#F0F0F0] text-sm group-hover:text-foreground/80 gap-[1px] transition-colors duration-200">
              <Hash className="size-3 font-medium text-secondary group-hover:text-foreground/60 transition-colors duration-200 " />
              {tag.toLowerCase()}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectTagsSection;
