import React from "react";
import MainGradient from "../ui/Text";
import {ChevronLeft} from "lucide-react";
import {Button} from "../shadcn/button";

const PageTitle = ({
  title,
  subtitle,
  hasArrow = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  hasArrow?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {hasArrow && (
          <Button size={"icon"} className="border-none" onClick={onClick}>
            <ChevronLeft size={22} strokeWidth={2} className="text-foreground/90" />
          </Button>
        )}

        <MainGradient as="h3" className="font-semibold text-2xl">
          {title}
        </MainGradient>
      </div>
      <p className="text-secondary text-sm">{subtitle}</p>
    </div>
  );
};

export default PageTitle;
