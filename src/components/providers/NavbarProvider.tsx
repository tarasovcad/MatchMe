import React from "react";
import {cn} from "@/lib/utils";
import Header from "../(pages)/landing/Header";
import {User} from "@supabase/supabase-js";
import Footer from "../(pages)/landing/Footer";

const NavbarProvider = ({
  children,
  className,
  user,
}: {
  children: React.ReactNode;
  className?: string;
  user: User | null;
}) => {
  return (
    <div className="min-h-svh flex flex-col">
      <div className="pb-[105px] sm:pb-[117px] md:pb-[119px] lg:pb-[121px] xl:pb-[127px]">
        <Header user={user} />
      </div>
      <main
        className={cn(
          "relative flex min-h-svh flex-1 flex-col bg-background w-full mx-auto max-w-[1184px] overflow-hidden ",
          className,
        )}>
        <div className="p-3 sm:p-4 md:p-6 ">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default NavbarProvider;
