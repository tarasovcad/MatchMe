"use server";

import {createClient} from "@/utils/supabase/server";

export async function handleStep1(data: {
  email: string;
  agreement?: boolean;
  page?: "login" | "signup";
}) {
  const {email, agreement, page = "login"} = data;

  // Basic email check
  if (!email || email.length === 0) {
    console.log("Email is empty");
    return {error: "Email is empty"};
  }

  // If the page is signup, ensure that the agreement is checked.
  if (page === "signup" && agreement !== true) {
    console.log("Agreement is not checked");
    return {error: "Agreement is not checked"};
  }

  try {
    const supabase = await createClient();

    // Run OTP send and profile lookup concurrently
    const [otpResponse, profileResponse] = await Promise.all([
      supabase.auth.signInWithOtp({email}),
      supabase
        .from("profiles")
        .select("id", {head: true, count: "exact"})
        .eq("email", email),
    ]);

    // Check for OTP errors first
    if (otpResponse.error) {
      console.log("OTP Error:", otpResponse.error);
      return {error: otpResponse.error.message};
    }

    // Check for any errors from the profile query
    if (profileResponse.error) {
      console.log("Profile Query Error:", profileResponse.error);
      return {error: profileResponse.error.message};
    }

    // Check if the user is new or existing
    if (profileResponse.count === 0) {
      console.log("No profile found");
      return {
        isNewUser: true,
        totalSteps: 3,
      };
    }

    return {
      isNewUser: false,
      totalSteps: 2,
    };
  } catch (error) {
    console.log("Unexpected error in handleStep1:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
