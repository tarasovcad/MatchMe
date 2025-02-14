import React from "react";
import MainGradient from "../ui/Text";

const PageTitle = ({title, subtitle}: {title: string; subtitle: string}) => {
  return (
    <div className="flex flex-col gap-1">
      <MainGradient as="h3" className="text-2xl font-semibold">
        {title}
      </MainGradient>
      <p className="text-sm text-secondary">{subtitle}</p>
    </div>
  );
};

export default PageTitle;
