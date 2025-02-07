import AuthSignUpClientPage from "@/components/auth/AuthSignUpClientPage";
import {createClient} from "@/utils/supabase/server";
import React from "react";

const SignUp = async () => {
  let isProfileComplete = null;
  const supabase = await createClient();
  const {data, error: userError} = await supabase.auth.getUser();
  // console.log(data);
  if (data.user) {
    isProfileComplete = data.user.user_metadata?.is_profile_complete || false;
    console.log(isProfileComplete, "isProfileComplete");
  }

  return <AuthSignUpClientPage isProfileComplete={isProfileComplete} />;
};

export default SignUp;
