"use server";

import {createClient} from "@/utils/supabase/server";

export async function signOut() {
  try {
    const supabase = await createClient();
    const {error} = await supabase.auth.signOut();
    if (error) {
      console.log(error);
      return {
        error: error.message,
      };
    }
    return {
      message: "Logged out successfully!",
    };
  } catch (error) {
    console.log("Undexpected error in handleStep1:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
