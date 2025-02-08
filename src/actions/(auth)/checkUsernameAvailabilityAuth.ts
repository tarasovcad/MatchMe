"use server";

import {createClient} from "@/utils/supabase/server";
export async function checkUsernameAvailabilityAuth(username: string) {
  const startTime = performance.now();
  try {
    if (username.length === 0) {
      return {
        error: "Username is required",
      };
    }
    const supabase = await createClient();

    const usernameLowerCase = username.toLowerCase();

    const {count, error} = await supabase
      .from("profiles")
      .select("username", {
        head: true,
        count: "exact",
      })
      .eq("username", usernameLowerCase);

    const isAvailable = count === 0;

    const endTime = performance.now();
    console.log(
      `Username availability check completed in ${(endTime - startTime).toFixed(
        2,
      )} ms`,
    );

    if (error) {
      return {
        error: error.message,
      };
    }
    if (isAvailable) {
      return {
        error: null,
        message: "Username is available",
      };
    }
    return {
      error: null,
      message: "Username is already taken",
    };
  } catch (error) {
    console.log("Undexpected error in checkUsernameAvailabilityAuth:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
