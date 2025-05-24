import {updateSession} from "@/utils/supabase/middleware";
import {createServerClient} from "@supabase/ssr";
import {type NextRequest, NextResponse} from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({name, value, options}) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {data} = await supabase.auth.getUser();
  const isProfileComplete = data?.user?.user_metadata?.is_profile_complete || false;
  const {pathname} = request.nextUrl;
  const referer = request.headers.get("referer") || "/";

  const notAllowedPathsForAuthenticated = ["/callback", "/complete-profile", "/signup", "/login"];

  const notAllowedPathsForNotAuthenticated = [
    "/settings",
    "/notifications",
    "/inbox",
    "/dashboard",
  ];

  // Redirect users with incomplete profiles, except on the complete-profile page
  //if (!isProfileComplete && pathname !== "/complete-profile") {
    //return NextResponse.redirect(new URL("/complete-profile", request.url));
  //}

  if (data.user) {
    // Prevent authenticated users from accessing auth pages
    if (isProfileComplete && notAllowedPathsForAuthenticated.includes(pathname)) {
      console.log(referer);
      return NextResponse.redirect(new URL(referer, request.url));
    }
  }
  // If the user is not authenticated, redirect them to the signup page
  else {
    if (notAllowedPathsForNotAuthenticated.includes(pathname)) {
      return NextResponse.redirect(new URL(referer, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
