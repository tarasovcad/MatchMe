import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {
  getChartGranularity,
  getDateRange,
  getComparisonDateRange,
  transformProfileEventsForChart,
} from "@/functions/analytics/analyticsDataTransformation";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
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
    const granularity = getChartGranularity(dateRange);

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

    // Get comparison data if comparison is enabled
    let comparisonData = undefined;
    let comparisonStart = undefined;
    let comparisonEnd = undefined;

    if (compareDateRange !== "Disabled") {
      const comparisonRange = getComparisonDateRange(dateRange, compareDateRange, profileCreatedAt);
      comparisonStart = comparisonRange.start;
      comparisonEnd = comparisonRange.end;

      const {data: comparisonInteractionsData, error: comparisonError} = await supabase
        .from("profile_events")
        .select("id, created_at, type")
        .eq("profile_id", profileId)
        .gte("created_at", comparisonStart)
        .lt("created_at", comparisonEnd)
        .order("created_at", {ascending: true});

      if (comparisonError) {
        console.error("Error fetching comparison data:", comparisonError);
        // Don't fail the request if comparison data fails, just continue without it
      } else {
        comparisonData = comparisonInteractionsData;
      }
    }

    // Transform the data using the new transformation function
    const chartData = transformProfileEventsForChart(
      interactionsData || [],
      start,
      end,
      granularity,
      comparisonData,
      comparisonStart,
      comparisonEnd,
    );

    return NextResponse.json({
      chartData,
    });
  } catch (error) {
    console.error("Error fetching profile events bar stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching profile events bar stats",
        message: error instanceof Error ? error.message : String(error),
        chartData: [],
      },
      {status: 500},
    );
  }
}
