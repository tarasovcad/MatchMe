"use server";
import {createClient} from "@/utils/supabase/server";

export async function handleGoogleAuth() {
  try {
    const supabase = await createClient();
    const response = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/callback",
      },
    });
    if (response.error) {
      return {
        error: response.error.message,
      };
    }

    return {
      error: response.error,
      link: response.data.url,
    };
  } catch (error) {
    console.log("Undexpected error in handleGoogleAuth:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
