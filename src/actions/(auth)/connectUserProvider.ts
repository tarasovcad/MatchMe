"use server";
import {createClient} from "@/utils/supabase/server";

export const connectUserProvider = async (provider: "google" | "github") => {
  try {
    const supabase = await createClient();
    if (provider !== "google" && provider !== "github") {
      return {
        error: "Invalid provider",
      };
    }
    const {error, data} = await supabase.auth.linkIdentity({
      provider: provider,
    });

    if (error) {
      console.error("Error linking provider:", error);
      return {
        error: error.message,
      };
    }

    return {
      message: "Connection added successfully",
      data: data.url,
    };
  } catch (error) {
    console.error("Error removing connection:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
