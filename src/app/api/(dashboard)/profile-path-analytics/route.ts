import {
  mapDateRangeToPostHog,
  getChartGranularity,
  transformPostHogDemographicsData,
  fetchCountryFlag,
  extractCountryName,
} from "@/functions/analytics/analyticsDataTransformation";
import {PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

const PROFILE_PATH_CONFIG: Record<
  string,
  {property: string; eventFilter?: Record<string, unknown>}
> = {
  "Entry path": {
    property: "$pathname",
    eventFilter: {
      key: "$session_id",
    },
  },
  "End path": {
    property: "$pathname",
  },
};

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const table = searchParams.get("table") || "profiles";
    const type = searchParams.get("type") || "Entry path";
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
    const breakdownType = searchParams.get("breakdownType") || "session";

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

    const config = PROFILE_PATH_CONFIG[type];
    if (!config) {
      return NextResponse.json({error: "Invalid path type"}, {status: 400});
    }

    let requestBody: PostHogRequestBody & {breakdown: string; breakdown_type: string};

    if (type === "Entry path") {
      requestBody = {
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
        breakdown: breakdownType === "session" ? "$entry_pathname" : "$referrer",
        breakdown_type: breakdownType as "session" | "event",
      };
    } else {
      requestBody = {
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
        breakdown: breakdownType === "session" ? "$exit_pathname" : "$pathname",
        breakdown_type: breakdownType as "session" | "event",
      };
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
      console.error("PostHog API error:", response.status, await response.text());
      return NextResponse.json({error: "Failed to fetch data from PostHog"}, {status: 500});
    }

    const data = (await response.json()) as PostHogResponse;

    const transformedData = transformPostHogDemographicsData(data, type);

    return NextResponse.json({data: transformedData});
  } catch (error) {
    console.error("Error fetching profile path analytics from PostHog:", error);
    return NextResponse.json(
      {
        error: "Error fetching profile path analytics from PostHog",
        message: error instanceof Error ? error.message : String(error),
        data: [],
      },
      {status: 500},
    );
  }
}
