import React from "react";
import {cn} from "@/lib/utils";

const NavbarProvider = ({
  children,
  navbar,
  removePadding,
  className,
}: {
  children: React.ReactNode;
  navbar?: React.ReactNode;
  removePadding?: boolean;
  className?: string;
}) => {
  return (
    <div className="min-h-svh flex flex-col">
      {navbar}
      <main
        className={cn(
          "relative flex min-h-svh flex-1 flex-col bg-background w-full mx-auto max-w-[1184px] overflow-hidden",
          className,
        )}>
        <div className={removePadding ? "" : "p-3 sm:p-4 md:p-6"}>{children}</div>
      </main>
    </div>
  );
};

export default NavbarProvider;
