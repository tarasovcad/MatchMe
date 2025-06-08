import React from "react";

const AnalyticsSectionHeader = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* left side - title */}
      <div className="flex flex-col gap-[3px]">
        <div className="flex items-center gap-1.5 ">
          <div className="size-[25px] border border-border rounded-[5px] flex items-center justify-center">
            {icon}
          </div>
          <h6 className="text-foreground text-[16px] font-medium">{title}</h6>
        </div>

        <p className="text-secondary text-xs font-medium">{description}</p>
      </div>
      {/* right side - button */}
      <div></div>
    </div>
  );
};

export default AnalyticsSectionHeader;
