import {Button} from "@/components/shadcn/button";
import {User} from "@supabase/supabase-js";
import Link from "next/link";
import React from "react";

const SidebarNotAuthButtons = ({user}: {user: User | null | undefined}) => {
  if (!user) {
    return (
      <div className="group-data-[state=collapsed]:hidden flex flex-col gap-2 px-2">
        <Link href={"/signup"}>
          <Button className="w-full" variant="secondary" size={"xs"}>
            Sign up
          </Button>
        </Link>
        <Link href={"/login"}>
          <Button className="w-full" variant="outline" size={"xs"}>
            Login
          </Button>
        </Link>
      </div>
    );
  }
};

export default SidebarNotAuthButtons;
