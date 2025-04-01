import ProfilesClientComponent from "@/components/(pages)/profiles/ProfilesClientComponent";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import React from "react";

const ProfilesPage = async () => {
  const supabase = await createClient();
  const {data: userSession} = await supabase.auth.getUser();
  return (
    <SidebarProvider>
      <ProfilesClientComponent userSession={userSession.user} />
    </SidebarProvider>
  );
};

export default ProfilesPage;
