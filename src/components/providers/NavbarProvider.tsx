import React from "react";
import {cn} from "@/lib/utils";
import Header from "../(pages)/landing/Header";

const NavbarProvider = ({children, className}: {children: React.ReactNode; className?: string}) => {
  return (
    <div className="min-h-svh flex flex-col">
      <div className="pb-10 sm:pb-12 md:pb-14 lg:pb-[56px] xl:pb-[62px]">
        <Header />
      </div>
      <main
        className={cn(
          "relative flex min-h-svh flex-1 flex-col bg-background w-full mx-auto max-w-[1184px] overflow-hidden ",
          className,
        )}>
        <div className="p-3 sm:p-4 md:p-6 ">{children}</div>
      </main>
    </div>
  );
};

export default NavbarProvider;
