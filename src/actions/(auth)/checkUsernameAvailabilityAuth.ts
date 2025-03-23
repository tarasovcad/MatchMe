"use server";

import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {createClient} from "@/utils/supabase/server";
export async function checkUsernameAvailabilityAuth(username: string) {
  const startTime = performance.now();
  try {
    if (username.length === 0) {
      return {
        error: "Username is required",
      };
    }
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return {error: "This username is reserved and cannot be used"};
    }
    if (!username || username.length < 3 || username.length > 20) {
      return {
        error: "Username must be between 3 and 20 characters long",
      };
    }
    if (hasProfanity(username)) {
      return {
        error:
          "Username contains inappropriate language. Please choose another.",
      };
    }

    const supabase = await createClient();

    const usernameTrimmed = username.trim().toLowerCase();

    const {count, error} = await supabase
      .from("profiles")
      .select("username", {
        head: true,
        count: "exact",
      })
      .eq("username", usernameTrimmed);

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
