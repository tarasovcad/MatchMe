import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {
  getChartGranularity,
  getDateRange,
  transformSupabaseDataForChart,
  getComparisonDateRange,
  calculateAnalyticsBadgeData,
} from "@/functions/analytics/analyticsDataTransformation";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Today";
    const compareDateRange = searchParams.get("compareDateRange") ?? "Disabled";

    if (!username) {
      return NextResponse.json({error: "Username is required"}, {status: 400});
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
    const {data: followsData, error: followsError} = await supabase
      .from("follows")
      .select("id, created_at")
      .eq("following_id", profileId)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", {ascending: true});

    if (followsError) {
      return NextResponse.json(
        {error: "Error fetching follows data", details: followsError.message},
        {status: 500},
      );
    }

    // Get comparison period data
    let comparisonFollowsData = null;
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
        .from("follows")
        .select("id, created_at")
        .eq("following_id", profileId)
        .gte("created_at", comparisonStart)
        .lt("created_at", comparisonEnd)
        .order("created_at", {ascending: true});

      if (!comparisonError && comparisonData) {
        comparisonFollowsData = comparisonData;

        // Calculate percentage change
        const currentTotal = followsData?.length || 0;
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
      followsData || [],
      start,
      end,
      granularity,
      comparisonFollowsData || undefined,
      comparisonStart || undefined,
      comparisonEnd || undefined,
    );

    return NextResponse.json({
      chartData,
      totalFollowers: followsData?.length || 0,
      previousPeriodFollowers: comparisonFollowsData?.length || 0,
      percentageChange,
      changeType,
      shouldShowBadge,
    });
  } catch (error) {
    console.error("Error fetching follower stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching follower stats",
        message: error instanceof Error ? error.message : String(error),
        chartData: [],
      },
      {status: 500},
    );
  }
}
