"use server";
import React from "react";
import NavbarProvider from "@/components/providers/NavbarProvider";
import NotFoundClient from "@/components/(pages)/other/NotFoundClient";
import {createClient} from "@/utils/supabase/server";

const NotFound = async () => {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  return (
    <NavbarProvider user={user}>
      <NotFoundClient user={user} />
    </NavbarProvider>
  );
};

export default NotFound;
