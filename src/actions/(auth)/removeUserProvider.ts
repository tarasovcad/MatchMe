"use server";
import {createClient} from "@/utils/supabase/server";

export const removeUserProvider = async (provider: "google" | "github") => {
  try {
    const supabase = await createClient();

    const {error: errorGetIdentities, data} =
      await supabase.auth.getUserIdentities();

    if (errorGetIdentities) {
      console.error("Error getting user identities:", errorGetIdentities);
      return {
        error: errorGetIdentities.message,
      };
    }
    if (!data) {
      return {
        error: "No user identities found",
      };
    }
    const identities = data?.identities || [];

    const providerIdentity = identities.find(
      (identity) => identity.provider === provider,
    );

    if (!providerIdentity) {
      return {
        error: `No ${provider} identity found`,
      };
    }

    const {error: errorUnlinkIdentity} =
      await supabase.auth.unlinkIdentity(providerIdentity);

    if (errorUnlinkIdentity) {
      console.error("Error removing connection:", errorUnlinkIdentity);
      return {
        error: errorUnlinkIdentity.message,
      };
    }

    return {
      message: "Connection removed successfully",
    };
  } catch (error) {
    console.error("Error removing connection:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
