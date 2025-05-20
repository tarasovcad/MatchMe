"use server";

import {createClient} from "@/utils/supabase/server";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";
export async function handleStep1(data: {
  email: string;
  agreement?: boolean;
  page?: "login" | "signup";
}) {
  const {email, agreement, page = "login"} = data;
  const ip = await getClientIp();

  // Basic email check
  if (!email || email.length === 0) {
    console.log("Email is empty");
    return {error: "Email is empty"};
  }

  // If the page is signup, ensure that the agreement is checked.
  if (page === "signup" && agreement !== true) {
    console.log("Agreement is not checked");
    return {error: "Agreement is not checked"};
  }

  try {
    const emailRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 attempts per 10 minutes per email
      analytics: true,
      prefix: "ratelimit:email:auth",
      enableProtection: true,
    });

    const ipRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"), // 20 attempts per 10 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:auth",
      enableProtection: true,
    });

    // Check rate limits
    const [emailLimit, ipLimit] = await Promise.all([
      emailRatelimit.limit(data.email),
      ipRatelimit.limit(ip),
    ]);

    if (!emailLimit.success) {
      return {
        error: "Too many attempts with this email. Please try again later.",
      };
    }

    if (!ipLimit.success) {
      return {error: "Too many login attempts. Please try again later."};
    }

    const supabase = await createClient();

    // Run OTP send and profile lookup concurrently
    const [otpResponse, profileResponse] = await Promise.all([
      supabase.auth.signInWithOtp({email}),
      supabase.from("profiles").select("id", {head: true, count: "exact"}).eq("email", email),
    ]);

    // Check for OTP errors first
    if (otpResponse.error) {
      console.log("OTP Error:", otpResponse.error);
      return {error: otpResponse.error.message};
    }

    // Check for any errors from the profile query
    if (profileResponse.error) {
      console.log("Profile Query Error:", profileResponse.error);
      return {error: profileResponse.error.message};
    }

    // Check if the user is new or existing
    if (profileResponse.count === 0) {
      console.log("No profile found");
      return {
        isNewUser: true,
        totalSteps: 3,
      };
    }

    return {
      isNewUser: false,
      totalSteps: 2,
    };
  } catch (error) {
    console.log("Unexpected error in handleStep1:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
