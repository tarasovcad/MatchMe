import {createClient} from "@/utils/supabase/server";
import router, {redirect} from "next/navigation";
import React from "react";

const page = async () => {
  const supabase = await createClient();
  const {data} = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  } else {
    redirect("/home");
  }
};

export default page;
