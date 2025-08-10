"use client";
import {Button} from "@/components/shadcn/button";
import React from "react";

const page = () => {
  const handleFetch = async () => {
    const response = await fetch(`/api/notifications`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "project_invite",
        recipientId: "42c1675d-fdcc-4ffd-b218-1ad8b28261c7",
        referenceId: "bc45add7-a878-4cf5-9657-b4ea45704098",
      }),
    });
  };

  return (
    <div>
      <Button onClick={handleFetch}>Fetch</Button>
    </div>
  );
};

export default page;
