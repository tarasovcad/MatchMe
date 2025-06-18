import {mapDateRangeToPostHog} from "@/functions/analytics/analyticsDataTransformation";
import {transformPostHogDataToHeatmap} from "@/functions/analytics/transformPostHogDataToHeatmap";
import {PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
    const type = searchParams.get("type") ?? "Visitors";

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

    let eventConfig;
    switch (type) {
      case "Visitors":
        eventConfig = {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "dau", // Daily Active Users (unique visitors)
        };
        break;
      case "Views":
        eventConfig = {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "total", // Total page views
        };
        break;
      case "Sessions":
        eventConfig = {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "unique_session", // Unique sessions
        };
        break;
      default:
        eventConfig = {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "dau",
        };
    }

    const requestBody = {
      events: [
        {
          ...eventConfig,
          properties: [
            // {
            //   key: "$pathname",
            //   value: route,
            //   type: "event",
            // },
            {
              key: "$host",
              value: "matchme.me",
              type: "event",
            },
          ],
        },
      ],
      interval: "hour",
      date_from,
      date_to,
    };

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
      return NextResponse.json({error: "Failed to fetch data from PostHog"}, {status: 500});
    }

    const data = (await response.json()) as PostHogResponse;

    const heatmapData = transformPostHogDataToHeatmap(data, dateRange);

    return NextResponse.json(
      {
        data: heatmapData,
        // rawData: data,
        meta: {
          dateRange,
          type,
          totalDataPoints: heatmapData.length,
        },
      },
      {status: 200},
    );
  } catch (error) {
    console.error("Profile heatmap API error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
