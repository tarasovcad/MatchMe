import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value}) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({name, value, options}) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  const {data} = await supabase.auth.getUser();
  const {pathname} = request.nextUrl;
  const referer = request.headers.get("referer") || "/";

  if (data.user) {
    const isProfileComplete =
      data.user.user_metadata?.is_profile_complete || false;

    const allowedPathsForNotAuthenticated = [
      "/auth/callback",
      "/complete-profile",
      "/home",
    ];

    const notAllowedPathsForAuthenticated = [
      "/auth/callback",
      "/complete-profile",
      "/signup",
      "/login",
    ];

    if (
      !isProfileComplete &&
      !allowedPathsForNotAuthenticated.includes(pathname)
    ) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    if (
      isProfileComplete &&
      notAllowedPathsForAuthenticated.includes(pathname)
    ) {
      return NextResponse.redirect(new URL(referer, request.url));
    }
  }

  return supabaseResponse;
}
