import {createClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const {searchParams, origin} = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const {error} = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(`${origin}/auth-code-error`);
    }

    // Fetch user data after authentication
    const {data: userData, error: fetchError} = await supabase.auth.getUser();

    if (fetchError || !userData?.user) {
      console.error("Error fetching user data:", fetchError?.message);
      return NextResponse.redirect(`${origin}/auth-code-error`);
    }

    const user = userData.user;
    const isProfileComplete = user.user_metadata?.is_profile_complete ?? false;

    const userFullName = user.user_metadata?.full_name || "";

    const userUsername = user.user_metadata?.user_name || "";

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

    const providerImage =
      user.user_metadata?.picture || user.user_metadata?.avatar_url;

    if (providerImage && user.user_metadata.image !== providerImage) {
      const {error: metadataError} = await supabase.auth.updateUser({
        data: {image: providerImage},
      });

      if (metadataError) {
        console.error("Error updating user metadata:", metadataError.message);
      } else {
        console.log("User metadata updated successfully");
      }
    }
    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === "development";
    if (isLocalEnv) {
      // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
}
