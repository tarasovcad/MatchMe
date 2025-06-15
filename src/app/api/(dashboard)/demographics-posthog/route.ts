import {
  mapDateRangeToPostHog,
  getChartGranularity,
  transformPostHogDemographicsData,
} from "@/functions/analytics/analyticsDataTransformation";
import {PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

// Map UI type to PostHog property key
const DEMOGRAPHIC_BREAKDOWN_MAP: Record<string, string> = {
  country: "$geoip_country_name", // e.g., "Canada"
  region: "$geoip_subdivision_1_name", // e.g., "Ontario"
  city: "$geoip_city_name", // e.g., "Toronto"
  language: "$browser_language", // e.g., "en-US"
  timezone: "$geoip_time_zone", // e.g., "America/Toronto"
};

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const table = searchParams.get("table") || "profiles";
    const type = searchParams.get("type") || "country";
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
    const breakdownProperty =
      DEMOGRAPHIC_BREAKDOWN_MAP[type.toLowerCase()] || "$geoip_country_name";

    // Build PostHog request body
    const requestBody: PostHogRequestBody & {breakdown: string; breakdown_type: string} = {
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "dau",
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
      breakdown_type: "event",
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

    // Transform the data into the standardized format
    const transformedData = transformPostHogDemographicsData(data);

    return NextResponse.json({data: transformedData});
  } catch (error) {
    console.error("Error fetching demographics from PostHog:", error);
    return NextResponse.json(
      {
        error: "Error fetching demographics from PostHog",
        message: error instanceof Error ? error.message : String(error),
        data: [],
      },
      {status: 500},
    );
  }
}
