import {
  mapDateRangeToPostHog,
  getChartGranularity,
  transformPostHogDemographicsData,
} from "@/functions/analytics/analyticsDataTransformation";
import {PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

// Map UI type to PostHog property key for device analytics
const DEVICE_BREAKDOWN_MAP: Record<string, string> = {
  "Device type": "$device_type", // e.g., "Desktop", "Mobile", "Tablet"
  Browser: "$browser", // e.g., "Chrome", "Firefox", "Safari"
  OS: "$os", // e.g., "Windows", "macOS", "iOS", "Android"
  Viewport: "concat(properties.$viewport_width, 'x', properties.$viewport_height)", // e.g., "1920x1080", "375x667"
};

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const table = searchParams.get("table") || "profiles";
    const type = searchParams.get("type") || "Device type";
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";

    if (!username) {
      return NextResponse.json({error: "Username is required"}, {status: 400});
    }

    const supabase = await createClient();
    const {data: profileData, error: profileError} = await supabase
      .from(table)
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
    const route = `/${table}/${username}`;
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_API_KEY;

    const {date_from, date_to} = mapDateRangeToPostHog(dateRange, profileCreatedAt);
    const interval = getChartGranularity(dateRange);

    // Determine breakdown property
    const breakdownProperty = DEVICE_BREAKDOWN_MAP[type] || "$device_type";

    // Determine if we're using a HogQL expression (like for viewport)
    const isHogQLExpression = breakdownProperty.includes("concat(");
    const breakdownType = isHogQLExpression ? "hogql" : "event";

    // Build PostHog request body
    const requestBody: PostHogRequestBody & {breakdown: string; breakdown_type: string} = {
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "dau", // daily active users for unique visitors per device/browser/os
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
      breakdown: breakdownProperty,
      breakdown_type: breakdownType,
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
      console.error("PostHog API error:", response.status, await response.text());
      return NextResponse.json({error: "Failed to fetch data from PostHog"}, {status: 500});
    }

    const data = (await response.json()) as PostHogResponse;

    const transformedData = transformPostHogDemographicsData(data, type);

    return NextResponse.json({data: transformedData});
  } catch (error) {
    console.error("Error fetching device analytics from PostHog:", error);
    return NextResponse.json(
      {
        error: "Error fetching device analytics from PostHog",
        message: error instanceof Error ? error.message : String(error),
        data: [],
      },
      {status: 500},
    );
  }
}
