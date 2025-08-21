import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {
  getChartGranularity,
  getDateRange,
  transformSupabaseDataForChart,
  getComparisonDateRange,
  calculateAnalyticsBadgeData,
} from "@/functions/analytics/analyticsDataTransformation";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Today";
    const compareDateRange = searchParams.get("compareDateRange") ?? "Disabled";

    if (!username) {
      return NextResponse.json({error: "Username is required"}, {status: 400});
    }

    const ip = await getClientIp();

    // Rate limiting for analytics endpoints
    const analyticsIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "5 m"), // 100 requests per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:analytics",
      enableProtection: true,
    });

    // Per-username rate limiting to prevent targeting specific users
    const analyticsUsernameLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "5 m"), // 30 requests per 5 minutes per username
      analytics: true,
      prefix: "ratelimit:username:analytics",
      enableProtection: true,
    });

    const [ipLimit, usernameLimit] = await Promise.all([
      analyticsIpLimiter.limit(ip),
      analyticsUsernameLimiter.limit(username),
    ]);

    if (!ipLimit.success) {
      return NextResponse.json(
        {error: "Too many analytics requests. Please slow down and try again later."},
        {status: 429},
      );
    }

    if (!usernameLimit.success) {
      return NextResponse.json(
        {error: "Too many requests for this profile's analytics. Please try again later."},
        {status: 429},
      );
    }

    const supabase = await createClient();

    // Get user profile ID
    const {data: profileData, error: profileError} = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        {error: "User profile not found", details: profileError?.message},
        {status: 404},
      );
    }

    const profileId = profileData.id;
    const profileCreatedAt = profileData.created_at;

    const {start, end} = getDateRange(dateRange, profileCreatedAt);

    // Get current period data
    const {data: interactionsData, error: interactionsError} = await supabase
      .from("profile_events")
      .select("id, created_at, type")
      .eq("profile_id", profileId)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", {ascending: true});

    if (interactionsError) {
      return NextResponse.json(
        {error: "Error fetching interactions data", details: interactionsError.message},
        {status: 500},
      );
    }

    // Get comparison period data
    let comparisonInteractionsData = null;
    let comparisonStart = "";
    let comparisonEnd = "";
    let percentageChange = 0;
    let changeType: "positive" | "negative" | "neutral" = "neutral";
    let shouldShowBadge = false;

    if (compareDateRange && compareDateRange !== "Disabled") {
      const comparisonRange = getComparisonDateRange(dateRange, compareDateRange, profileCreatedAt);
      comparisonStart = comparisonRange.start;
      comparisonEnd = comparisonRange.end;

      const {data: comparisonData, error: comparisonError} = await supabase
        .from("profile_events")
        .select("id, created_at, type")
        .eq("profile_id", profileId)
        .gte("created_at", comparisonStart)
        .lt("created_at", comparisonEnd)
        .order("created_at", {ascending: true});

      if (!comparisonError && comparisonData) {
        comparisonInteractionsData = comparisonData;

        // Calculate percentage change
        const currentTotal = interactionsData?.length || 0;
        const previousTotal = comparisonData?.length || 0;
        const changeResult = calculateAnalyticsBadgeData(
          currentTotal,
          previousTotal,
          compareDateRange,
        );

        percentageChange = changeResult.percentageChange;
        changeType = changeResult.changeType;
        shouldShowBadge = true;
      }
    }

    const granularity = getChartGranularity(dateRange);

    const chartData = transformSupabaseDataForChart(
      interactionsData || [],
      start,
      end,
      granularity,
      comparisonInteractionsData || undefined,
      comparisonStart || undefined,
      comparisonEnd || undefined,
    );

    return NextResponse.json({
      chartData,
      totalInteractions: interactionsData?.length || 0,
      previousPeriodInteractions: comparisonInteractionsData?.length || 0,
      percentageChange,
      changeType,
      shouldShowBadge,
    });
  } catch (error) {
    console.error("Error fetching profile interactions stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching profile interactions stats",
        message: error instanceof Error ? error.message : String(error),
        chartData: [],
      },
      {status: 500},
    );
  }
}
