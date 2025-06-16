import {
  mapDateRangeToPostHog,
  getChartGranularity,
  transformPostHogDemographicsData,
  fetchCountryFlag,
  fetchCountryFlagByLanguage,
  extractCountryName,
} from "@/functions/analytics/analyticsDataTransformation";
import {PostHogRequestBody, PostHogResponse} from "@/types/analytics";
import {createClient} from "@/utils/supabase/server";
import {NextRequest, NextResponse} from "next/server";

// Map UI type to PostHog property key
const DEMOGRAPHIC_BREAKDOWN_MAP: Record<string, string> = {
  Map: "$geoip_country_name", // e.g., "Canada"
  Counties: "$geoip_country_name", // e.g., "Canada"
  Regions: "concat(properties.$geoip_country_name, ' - ', properties.$geoip_subdivision_1_name)", // e.g., "Canada - Ontario"
  Cities: "concat(properties.$geoip_country_name, ' - ', properties.$geoip_city_name)", // e.g., "Canada - Toronto"
  Languages: "$browser_language", // e.g., "en-US"
  Timezones: "$geoip_time_zone", // e.g., "America/Toronto"
};

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const table = searchParams.get("table") || "profiles";
    const type = searchParams.get("type") || "Map";
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
    const breakdownProperty = DEMOGRAPHIC_BREAKDOWN_MAP[type] || "$geoip_country_name";

    // Determine if we're using a SQL expression (HogQL) or a simple property
    const isHogQLExpression = breakdownProperty.includes("concat(");
    const breakdownType = isHogQLExpression ? "hogql" : "event";

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
      return NextResponse.json({error: "Failed to fetch data from PostHog"}, {status: 500});
    }

    const data = (await response.json()) as PostHogResponse;

    // Transform the data into the standardized format
    const transformedData = transformPostHogDemographicsData(data, type);

    // Add flags for country-related demographics
    const dataWithFlags = await Promise.all(
      transformedData.map(async (item) => {
        if (type === "Languages") {
          // For languages, extract the language code from the label and get the flag
          const languageCodeMatch = item.label.match(/\(([^)]+)\)$/);
          if (languageCodeMatch) {
            const languageCode = languageCodeMatch[1];
            const flag = await fetchCountryFlagByLanguage(languageCode);
            return {...item, flag};
          }
          return item;
        } else {
          // For other types, use the existing country extraction logic
          const countryName = extractCountryName(item.label, type);
          if (countryName) {
            const flag = await fetchCountryFlag(countryName);
            return {...item, flag};
          }
          return item;
        }
      }),
    );

    return NextResponse.json({data: dataWithFlags});
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
