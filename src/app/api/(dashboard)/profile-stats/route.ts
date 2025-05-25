import {calculateAnalyticsBadgeData} from "@/functions/analytics/analyticsDataTransformation";
import {getComparisonDateRange} from "@/functions/getComparisonDateRange";
import {mapDateRangeToPostHog} from "@/functions/mapDateRangeToPostHog";
import {transformPostHogData} from "@/functions/transformPostHogData";

import {ChartDataPoint, PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const slug = searchParams.get("slug");
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
    const compareDateRange = searchParams.get("compareDateRange") ?? "Previous Period";

    if (!slug) {
      return NextResponse.json({error: "Slug is required"}, {status: 400});
    }

    const route = `/profiles/${slug}`;
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_API_KEY;

    const {date_from, date_to, interval} = mapDateRangeToPostHog(dateRange);

    // Request body for total views
    const viewsRequestBody: PostHogRequestBody = {
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "total", // Total views
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
    };

    // Request body for unique visitors
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
    };

    if (date_to) {
      viewsRequestBody.date_to = date_to;
      uniqueVisitorsRequestBody.date_to = date_to;
    }

    // Make parallel requests for both total views and unique visitors
    const [viewsResponse, uniqueVisitorsResponse] = await Promise.all([
      fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(viewsRequestBody),
      }),
      fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uniqueVisitorsRequestBody),
      }),
    ]);

    if (!viewsResponse.ok || !uniqueVisitorsResponse.ok) {
      const errorText = !viewsResponse.ok
        ? await viewsResponse.text()
        : await uniqueVisitorsResponse.text();
      console.error("PostHog API error:", errorText);
      return NextResponse.json(
        {error: "Failed to fetch data from PostHog", details: errorText},
        {status: 500},
      );
    }

    const viewsData = (await viewsResponse.json()) as PostHogResponse;
    const uniqueVisitorsData = (await uniqueVisitorsResponse.json()) as PostHogResponse;

    const viewsChartData = transformPostHogData(viewsData, dateRange);
    const uniqueVisitorsChartData = transformPostHogData(uniqueVisitorsData, dateRange);

    let viewsComparisonChartData: ChartDataPoint[] = [];
    let uniqueVisitorsComparisonChartData: ChartDataPoint[] = [];

    if (compareDateRange !== "Disabled" && dateRange !== "All Time") {
      // Calculate comparison date parameters based on comparison type
      const comparisonParams = getComparisonDateRange(dateRange, compareDateRange);

      if (comparisonParams) {
        const viewsComparisonRequestBody = {
          ...viewsRequestBody,
          date_from: comparisonParams.date_from,
          interval: comparisonParams.interval,
        };

        const uniqueVisitorsComparisonRequestBody = {
          ...uniqueVisitorsRequestBody,
          date_from: comparisonParams.date_from,
          interval: comparisonParams.interval,
        };

        if (comparisonParams.date_to) {
          viewsComparisonRequestBody.date_to = comparisonParams.date_to;
          uniqueVisitorsComparisonRequestBody.date_to = comparisonParams.date_to;
        }

        const [viewsComparisonResponse, uniqueVisitorsComparisonResponse] = await Promise.all([
          fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(viewsComparisonRequestBody),
          }),
          fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(uniqueVisitorsComparisonRequestBody),
          }),
        ]);

        if (viewsComparisonResponse.ok && uniqueVisitorsComparisonResponse.ok) {
          const viewsComparisonData = (await viewsComparisonResponse.json()) as PostHogResponse;
          const uniqueVisitorsComparisonData =
            (await uniqueVisitorsComparisonResponse.json()) as PostHogResponse;

          viewsComparisonChartData = transformPostHogData(viewsComparisonData, dateRange);
          uniqueVisitorsComparisonChartData = transformPostHogData(
            uniqueVisitorsComparisonData,
            dateRange,
          );
        }
      }
    }

    try {
      // Merge chart data with comparison data
      const mergedViewsChartData = viewsChartData.map((item, index) => {
        return {
          ...item,
          secondDate: viewsComparisonChartData[index]?.firstDate || 0,
        };
      });

      const mergedUniqueVisitorsChartData = uniqueVisitorsChartData.map((item, index) => {
        return {
          ...item,
          secondDate: uniqueVisitorsComparisonChartData[index]?.firstDate || 0,
        };
      });

      // Calculate totals for current period
      const currentPeriodViews = viewsChartData.reduce((sum, item) => {
        const views = Math.round(item.firstDate);
        return sum + views;
      }, 0);

      const currentPeriodUniqueVisitors = uniqueVisitorsChartData.reduce((sum, item) => {
        const visitors = Math.round(item.firstDate);
        return sum + visitors;
      }, 0);

      // Calculate totals for previous period
      const previousPeriodViews = viewsComparisonChartData.reduce((sum, item) => {
        const views = Math.round(item.firstDate);
        return sum + views;
      }, 0);

      const previousPeriodUniqueVisitors = uniqueVisitorsComparisonChartData.reduce((sum, item) => {
        const visitors = Math.round(item.firstDate);
        return sum + visitors;
      }, 0);

      // Calculate percentage changes and badge data
      const viewsBadgeData = calculateAnalyticsBadgeData(
        currentPeriodViews,
        previousPeriodViews,
        compareDateRange,
      );

      const uniqueVisitorsBadgeData = calculateAnalyticsBadgeData(
        currentPeriodUniqueVisitors,
        previousPeriodUniqueVisitors,
        compareDateRange,
      );

      return NextResponse.json({
        views: {
          chartData: mergedViewsChartData,
          totalViews: currentPeriodViews,
          previousPeriodViews,
          percentageChange: viewsBadgeData.percentageChange,
          changeType: viewsBadgeData.changeType,
          shouldShowBadge: viewsBadgeData.shouldShowBadge,
        },
        uniqueVisitors: {
          chartData: mergedUniqueVisitorsChartData,
          totalVisitors: currentPeriodUniqueVisitors,
          previousPeriodVisitors: previousPeriodUniqueVisitors,
          percentageChange: uniqueVisitorsBadgeData.percentageChange,
          changeType: uniqueVisitorsBadgeData.changeType,
          shouldShowBadge: uniqueVisitorsBadgeData.shouldShowBadge,
        },
      });
    } catch (error) {
      console.error("Error in profile-stats API route:", error);
      // Return more detailed error information to the client
      return NextResponse.json(
        {
          views: {
            chartData: [],
            totalViews: 0,
            previousPeriodViews: 0,
            percentageChange: 0,
            changeType: "neutral",
            shouldShowBadge: false,
          },
          uniqueVisitors: {
            chartData: [],
            totalVisitors: 0,
            previousPeriodVisitors: 0,
            percentageChange: 0,
            changeType: "neutral",
            shouldShowBadge: false,
          },
          followers: {
            chartData: [],
            totalFollowers: 0,
            previousPeriodFollowers: 0,
            percentageChange: 0,
            changeType: "neutral",
            shouldShowBadge: false,
            error: error instanceof Error ? error.message : String(error),
          },
          error: "Error fetching profile stats",
          message: error instanceof Error ? error.message : String(error),
          stack:
            process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : null,
        },
        {status: 200},
      );
    }
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching profile stats",
        message: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : null,
      },
      {status: 500},
    );
  }
}
