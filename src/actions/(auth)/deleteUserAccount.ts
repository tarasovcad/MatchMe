"use server";
import {createClient as createAdminClient} from "@/utils/supabase/admin";
import {createClient} from "@/utils/supabase/server";
import {User} from "@supabase/supabase-js";

export const deleteUserAccount = async (user: User) => {
  try {
    const admin = await createAdminClient();
    const supabase = await createClient();
    const {error: signOutError} = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Error signing out:", signOutError);
      return {error: signOutError, message: "Error signing out"};
    }

    const {error: deleteError} = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return {error: deleteError, message: "Error deleting user"};
    }
    const {error} = await supabase.from("profiles").delete().eq("id", user.id);

    if (error) {
      console.error("Error deleting user:", error);
      return {error: error, message: "Error deleting user"};
    }

    return {
      error: null,
      message: "User account deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {error: error, message: "Error deleting user account"};
  }
};
