"use server";

import {createClient} from "@/utils/superbase/server";

export async function handleStep2(data: {email: string; otp: string}) {
  try {
    const supabase = await createClient();
    const {email, otp} = data;
    const {data: verifyData, error} = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    console.log(verifyData, "verifyData");
    if (error) {
      console.log(error);
      return {
        error: error.message,
      };
    }
    return;
  } catch (error) {
    console.log("Undexpected error in handleStep2:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
