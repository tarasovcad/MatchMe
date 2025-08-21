import React from "react";

const ProjectSimilarSection = () => {
  return (
    <div className={`flex flex-col justify-between items-start gap-3`}>
      <div className={`flex flex-col gap-[1px] w-full`}>
        <p className="font-medium text-foreground text-base">Similar Projects:</p>
      </div>
      <div className="w-full flex flex-wrap gap-2">Loading...</div>
    </div>
  );
};

export default ProjectSimilarSection;
