import CreateProject from "@/components/(pages)/dashboard/create-project/CreateProject";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import React from "react";

const page = async () => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User is not logged in</div>;
  }

  const {count: projectCount, error} = await supabase
    .from("projects")
    .select("*", {count: "exact", head: true})
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching project count:", error);
  }

  return (
    <SidebarProvider>
      <CreateProject projectCount={projectCount || 0} />
    </SidebarProvider>
  );
};

export default page;
