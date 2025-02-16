import Link from "next/link";
import React from "react";
import {LogoImage, LogoText} from "../Logo";
import {SidebarTrigger} from "@/components/shadcn/sidebar";
import {Search} from "lucide-react";
import {Button} from "@/components/shadcn/button";

const Navbar = () => {
  return (
    <div className="md:hidden block p-2 w-full bg-sidebar-background border-b border-sidebar-border">
      <div className="flex flex-col gap-2 ">
        <div className="py-3 px-[6px] flex items-center justify-between ">
          <Link href={"/"} className="flex items-center gap-[6px] min-h-[29px]">
            <LogoImage size={24} />
            <LogoText className="transition-opacity duration-300 ease-in-out" />
          </Link>
          <div className="transition-opacity duration-300 ease-in-out flex items-center gap-2 justify-center">
            <Button
              data-sidebar="trigger"
              variant="ghost"
              size="icon"
              className="h-7 w-7">
              <Search size={18} className="stroke-[2]" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <SidebarTrigger svgSize={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
