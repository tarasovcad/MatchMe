"use server";

import {createClient} from "@/utils/supabase/server";

export async function handleStep2(data: {email: string; otp: string}) {
  try {
    const supabase = await createClient();
    const {email, otp} = data;

    // Verify OTP
    const {error, data: authData} = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.log(error);
      return {error: error.message};
    }

    // Get the authenticated user's ID
    const user = authData?.user;
    if (!user) {
      return {error: "User not found after OTP verification"};
    }

    // Check if the user already has metadata
    const {data: userData, error: fetchError} = await supabase.auth.getUser();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError.message);
      return {error: "Failed to fetch user data"};
    }

    const isProfileComplete =
      userData?.user?.user_metadata?.is_profile_complete || false;

    // If the metadata is missing, update the user metadata
    if (!isProfileComplete) {
      const {error: metadataError} = await supabase.auth.updateUser({
        data: {is_profile_complete: false},
      });

      if (metadataError) {
        console.error("Error updating metadata:", metadataError.message);
        return {error: "Failed to update user metadata"};
      }
    }

    return {message: "OTP verified successfully!"};
  } catch (error) {
    console.log("Unexpected error in handleStep2:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
