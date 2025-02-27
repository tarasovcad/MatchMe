import {createClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    const {searchParams, origin} = new URL(request.url);
    console.log("origin", origin);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      console.error("Missing authorization code");
      return NextResponse.redirect(
        `${origin}/auth-code-error?error=missing_code`,
      );
    }

    const supabase = await createClient();
    const {error} = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(
        `${origin}/auth-code-error?error=${encodeURIComponent(error.message)}`,
      );
    }

    // const {data: sessionData, error: sessionError} =
    //   await supabase.auth.getSession();
    // if (sessionError || !sessionData.session) {
    //   console.error("Error fetching session:", sessionError?.message);
    //   return NextResponse.redirect(
    //     `${origin}/auth-code-error?error=session_error`,
    //   );
    // }

    // Fetch user data after authentication
    const {data: userData, error: fetchError} = await supabase.auth.getUser();

    if (fetchError || !userData?.user) {
      console.error("Error fetching user data:", fetchError?.message);
      return NextResponse.redirect(
        `${origin}/auth-code-error?error=${encodeURIComponent(fetchError?.message || "Unknown error")}`,
      );
    }

    const user = userData.user;
    const isProfileComplete = user.user_metadata?.is_profile_complete ?? false;
    const userFullName = user.user_metadata?.full_name || "";
    const userUsername = user.user_metadata?.user_name || "";
    const userImage = user.user_metadata?.image || "";
    const userId = userData.user.id;
    const providerImage =
      user.user_metadata?.picture || user.user_metadata?.avatar_url;
    if (!userImage) {
      console.log("No provider image found so updating user profile");
      const {error: metadataError} = await supabase.auth.updateUser({
        data: {image: providerImage},
      });

      const {error: profileError} = await supabase
        .from("profiles")
        .update({
          image: providerImage,
        })
        .eq("id", userId);

      if (profileError) {
        console.log("Error updating user profile:", profileError.message);
      }

      if (metadataError) {
        console.log("Error updating user metadata:", metadataError.message);
      } else {
        console.log("User metadata updated successfully");
      }
    }

    // If is_profile_complete is missing, update it to false
    if (!isProfileComplete) {
      const {error: metadataError} = await supabase.auth.updateUser({
        data: {is_profile_complete: false},
      });

      if (metadataError) {
        console.error("Error updating user metadata:", metadataError.message);
      }
      return NextResponse.redirect(
        `${origin}/complete-profile?name=${encodeURIComponent(userFullName)}&username=${encodeURIComponent(userUsername)}`,
      );
    }

    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    
    return NextResponse.redirect(
  `https://matchme.me${next}?debug=true&env=${encodeURIComponent(process.env.NODE_ENV)}&origin=${encodeURIComponent(origin)}&host=${encodeURIComponent(forwardedHost || 'none')}`
);
  } catch (err) {
    console.error("Unexpected error in callback:", err);
    return NextResponse.redirect(
      `${origin}/auth-code-error?error=unexpected_error`,
    );
  }
}
