"use server";
import {createClient} from "@/utils/supabase/server";

export async function getUserRole() {
  const supabase = await createClient();
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();
  if (!user || error) return null;
  const userRole = user?.user_metadata?.role;

  if (error) {
    console.log("Error fetching user role:", error);
    return null;
  }

  return userRole;
}
