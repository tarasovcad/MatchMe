import {
  getChartGranularity,
  mapDateRangeToPostHog,
  transformPostHogDataWithComparison,
  getComparisonDateRangeForPostHog,
  calculateAnalyticsBadgeData,
} from "@/functions/analytics/analyticsDataTransformation";
import {PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

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

    const profileCreatedAt = profileData.created_at;
    const route = `/profiles/${username}`;
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_API_KEY;

    const {date_from, date_to} = mapDateRangeToPostHog(dateRange, profileCreatedAt);
    const interval = getChartGranularity(dateRange);

    // Request body for current period views
    const uniqueVisitorsRequestBody: PostHogRequestBody = {
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "dau", // dau = daily active users, which gives us unique visitors
          properties: [
            {
              key: "$pathname",
              value: route,
              type: "event",
            },
            {
              key: "$host",
              value: "matchme.me",
              type: "event",
            },
          ],
        },
      ],
      interval,
      date_from,
      date_to,
    };

    // Fetch current period data
    const uniqueVisitorsResponse = await fetch(
      `https://app.posthog.com/api/projects/${projectId}/insights/trend`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uniqueVisitorsRequestBody),
      },
    );

    if (!uniqueVisitorsResponse.ok) {
      return NextResponse.json({error: "Failed to fetch data from PostHog"}, {status: 500});
    }

    const uniqueVisitorsData = (await uniqueVisitorsResponse.json()) as PostHogResponse;

    // Fetch comparison period data if needed
    let comparisonUniqueVisitorsData: PostHogResponse | undefined;
    let previousPeriodUniqueVisitors = 0;
    let percentageChange = 0;
    let changeType: "positive" | "negative" | "neutral" = "neutral";
    let shouldShowBadge = false;

    if (compareDateRange && compareDateRange !== "Disabled") {
      const {date_from: comparisonDateFrom, date_to: comparisonDateTo} =
        getComparisonDateRangeForPostHog(dateRange, compareDateRange, profileCreatedAt);

      const comparisonRequestBody: PostHogRequestBody = {
        ...uniqueVisitorsRequestBody,
        date_from: comparisonDateFrom,
        date_to: comparisonDateTo,
      };

      const comparisonResponse = await fetch(
        `https://app.posthog.com/api/projects/${projectId}/insights/trend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comparisonRequestBody),
        },
      );

      if (comparisonResponse.ok) {
        comparisonUniqueVisitorsData = (await comparisonResponse.json()) as PostHogResponse;

        // Calculate previous period total
        if (comparisonUniqueVisitorsData.result?.[0]?.data) {
          previousPeriodUniqueVisitors = comparisonUniqueVisitorsData.result[0].data.reduce(
            (sum: number, value: number) => {
              return sum + (value || 0);
            },
            0,
          );
        }
      }
    }

    // Transform data with comparison
    const uniqueVisitorsChartData = transformPostHogDataWithComparison(
      uniqueVisitorsData,
      comparisonUniqueVisitorsData,
    );

    // Calculate totals for current period
    const currentPeriodUniqueVisitors = uniqueVisitorsChartData.reduce((sum, item) => {
      const uniqueVisitors = Math.round(item.firstDate);
      return sum + uniqueVisitors;
    }, 0);

    // Calculate analytics badge data
    if (compareDateRange && compareDateRange !== "Disabled") {
      const badgeData = calculateAnalyticsBadgeData(
        currentPeriodUniqueVisitors,
        previousPeriodUniqueVisitors,
        compareDateRange,
      );
      percentageChange = badgeData.percentageChange;
      changeType = badgeData.changeType;
      shouldShowBadge = badgeData.shouldShowBadge;
    }

    return NextResponse.json({
      chartData: uniqueVisitorsChartData,
      totalUniqueVisitors: currentPeriodUniqueVisitors,
      previousPeriodUniqueVisitors,
      percentageChange,
      changeType,
      shouldShowBadge,
    });
  } catch (error) {
    console.error("Error fetching unique visitors stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching unique visitors stats",
        message: error instanceof Error ? error.message : String(error),
        chartData: [],
      },
      {status: 500},
    );
  }
}
