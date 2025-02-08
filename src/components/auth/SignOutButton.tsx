"use client";
import React from "react";
import {Button} from "../shadcn/button";
import {supabase} from "@/utils/supabase/client";
import {toast} from "sonner";
import {signOut} from "@/actions/(auth)/signOut";

const SignOutButton = () => {
  const signOutUser = async () => {
    console.log("Signing out");
    const response = await signOut();
    console.log(response);
    if (response.error) {
      console.log(response.error);
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
  };
  return (
    <Button variant={"default"} onClick={signOutUser}>
      Sign out
    </Button>
  );
};

export default SignOutButton;
