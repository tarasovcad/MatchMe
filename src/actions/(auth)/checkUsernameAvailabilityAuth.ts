"use server";
import {createClient} from "@/utils/supabase/server";

export async function checkUsernameAvailabilityAuth(username: string) {
  try {
    console.log("Checking username availability...");
    if (username.length === 0) {
      return {
        error: "Username is required",
      };
    }
    const supabase = await createClient();
    const {data, error} = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();
    console.log(data);

    if (error) {
      return {
        error: error.message,
      };
    } else if (data) {
      return {
        error: null,
        message: "Username is already taken",
      };
    }
    return {
      error: null,
      message: "Username is available",
    };
  } catch (error) {
    console.log("Undexpected error in handleProviderAuth:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
