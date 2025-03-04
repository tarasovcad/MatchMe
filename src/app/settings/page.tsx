import SidebarProvider from "@/providers/SidebarProvider";

import {createClient} from "@/utils/supabase/server";
import React from "react";

import SettingsClientPage from "@/components/(pages)/settings/SettingsClientPage";
interface PageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const SettingsPage = async ({searchParams}: PageProps) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not logged in</div>;
  }

  const {id} = user;

  const {data: profile, error: profileError} = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError) {
    console.log("Error fetching profile:", profileError.message);
    return <div>Error fetching profile</div>;
  }
  const {data, error} = await supabase.from("skills").select("name");

  // change from name to value for multiselect
  const skillsArray =
    data?.map((skill) => ({
      value: skill.name,
    })) || [];

  if (error) {
    console.log("Error fetching skills:", error.message);
    return <div>Error fetching skills</div>;
  }

  const params = await searchParams;
  const tab = params?.tab ?? "account";

  return (
    <SidebarProvider>
      <SettingsClientPage
        tab={tab}
        profile={profile}
        skillsArray={skillsArray || []}
      />
    </SidebarProvider>
  );
};

export default SettingsPage;
