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

    const requestBody: PostHogRequestBody = {
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "total",
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
      requestBody.date_to = date_to;
    }

    const response = await fetch(
      `https://app.posthog.com/api/projects/${projectId}/insights/trend`,

      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PostHog API error:", errorText);
      return NextResponse.json(
        {error: "Failed to fetch data from PostHog"},
        {status: response.status},
      );
    }

    const primaryData = (await response.json()) as PostHogResponse;
    const primaryChartData = transformPostHogData(primaryData, dateRange);

    let comparisonChartData: ChartDataPoint[] = [];

    if (compareDateRange !== "Disabled") {
      // Calculate comparison date parameters based on comparison type
      const comparisonParams = getComparisonDateRange(dateRange, compareDateRange);

      if (comparisonParams) {
        const comparisonRequestBody = {
          ...requestBody,
          date_from: comparisonParams.date_from,
          interval: comparisonParams.interval,
        };

        if (comparisonParams.date_to) {
          comparisonRequestBody.date_to = comparisonParams.date_to;
        }

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
          const comparisonData = (await comparisonResponse.json()) as PostHogResponse;
          comparisonChartData = transformPostHogData(comparisonData, dateRange);
        }
      }
    }
    const mergedChartData = primaryChartData.map((item, index) => {
      return {
        ...item,
        secondDate: comparisonChartData[index]?.firstDate || 0,
      };
    });

    return NextResponse.json({
      chartData: compareDateRange !== "Disabled" ? mergedChartData : primaryChartData,
      totalViews: primaryChartData.reduce((sum, item) => sum + item.firstDate, 0),
      primaryData: primaryData,
    });
  } catch (error) {
    console.error("Error fetching profile views:", error);
    return NextResponse.json({error: "Error fetching profile views"});
  }
}
