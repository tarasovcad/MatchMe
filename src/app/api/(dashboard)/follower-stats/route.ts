import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {
  getChartGranularity,
  getDateRange,
  transformFollowerDataForChart,
} from "@/functions/analytics/analyticsDataTransformation";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
    const compareDateRange = searchParams.get("compareDateRange") ?? "Previous Period";

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

    const {data: followsData, error: followsError} = await supabase
      .from("follows")
      .select("id, created_at")
      .eq("following_id", profileId)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", {ascending: true});

    console.log(start, end);

    if (followsError) {
      return NextResponse.json(
        {error: "Error fetching follows data", details: followsError.message},
        {status: 500},
      );
    }
    const granularity = getChartGranularity(dateRange);

    const chartData = transformFollowerDataForChart(followsData, start, end, granularity);

    console.log(chartData);
    return NextResponse.json({
      chartData,
      totalFollowers: followsData?.length || 0,
      percentageChange: 0,
      changeType: "neutral",
      shouldShowBadge: false,
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
