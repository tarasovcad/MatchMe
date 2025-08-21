import ProfilesClientPage from "@/components/(pages)/profiles/ProfilesClientPage";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import {getAllProfiles} from "@/actions/profiles/profiles";
import React from "react";

const ProfilesPage = async () => {
  const supabase = await createClient();
  const {data: userSession} = await supabase.auth.getUser();

  // Fetch initial 15 profiles server-side for immediate display
  const initialProfiles = await getAllProfiles(1, 15);

  return (
    <SidebarProvider>
      <ProfilesClientPage userSession={userSession.user} initialProfiles={initialProfiles} />
    </SidebarProvider>
  );
};

export default ProfilesPage;
