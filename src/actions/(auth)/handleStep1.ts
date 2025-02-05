"use server";

import {createClient} from "@/utils/superbase/server";

// Step 1: Send OTP
export async function handleStep1(data: {email: string; agreement: boolean}) {
  try {
    const supabase = await createClient();
    const {email, agreement} = data;
    if (agreement === true && email.length !== 0) {
      // Send OTP

      const {error} = await supabase.auth.signInWithOtp({email});

      if (error) {
        console.log(error);
        return {
          error: error.message,
        };
      }

      // Check if user exists in profiles table
      const {data: userData, error: userError} = await supabase
        .from("profiles")
        .select("*")
        .eq("email", data.email);
      console.log(data, "data");

      if (userError || userData.length === 0) {
        return {
          isNewUser: true,
          totalSteps: 3,
          message: "User not found, continue to step 3",
        };
      }
      return {
        isNewUser: false,
        totalSteps: 2,
        message: "User found, continue to step 2",
      };
    } else {
      console.log("Agreement is not checked or email is empty");
      return {
        error: "Agreement is not checked or email is empty",
      };
    }
  } catch (error) {
    console.log("Undexpected error in handleStep1:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
