import {Button} from "@/components/shadcn/button";
import React from "react";

const DangerZone = () => {
  return (
    <div>
      <Button
        size={"sm"}
        className="flex items-center gap-2 rounded-[8px] text-destructive hover:text-destructive/90">
        Delete Account
      </Button>
    </div>
  );
};

export default DangerZone;
