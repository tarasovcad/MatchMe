"use server";

import {createClient} from "@/utils/superbase/server";

// Step 1: Send OTP
export async function handleStep3(data: {email: string; agreement: boolean}) {
  try {
    const supabase = await createClient();
    const {email, agreement} = data;
  } catch (error) {
    console.log("Undexpected error in handleStep1:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
