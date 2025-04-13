import {Button} from "@/components/shadcn/button";
import {User} from "@supabase/supabase-js";

import React from "react";
import SignUpDialog from "../dialog/SignUpDialog";

const SidebarNotAuthButtons = ({user}: {user: User | null | undefined}) => {
  if (!user) {
    return (
      <div className="group-data-[state=collapsed]:hidden flex flex-col gap-2 px-2">
        <SignUpDialog>
          <Button className="w-full" variant="secondary" size={"xs"}>
            Sign up
          </Button>
        </SignUpDialog>
        <SignUpDialog>
          <Button className="w-full" variant="outline" size={"xs"}>
            Login
          </Button>
        </SignUpDialog>
      </div>
    );
  }
};

export default SidebarNotAuthButtons;
