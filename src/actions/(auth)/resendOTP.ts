"use server";
import {createClient} from "@/utils/supabase/server";

export const resendOTP = async ({email}: {email: string}) => {
  try {
    const supabase = await createClient();
    const {error} = await supabase.auth.signInWithOtp({email});
    if (error) {
      console.error("Error resending code:", error);
      return {
        error: error.message,
        message: "Failed to resend code. Please try again.",
      };
    }
    return {
      message: "New OTP sent successfully!",
    };
  } catch (error) {
    console.error("Error resending code:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
