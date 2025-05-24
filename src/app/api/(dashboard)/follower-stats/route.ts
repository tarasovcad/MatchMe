import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

type ChartDataPoint = {
  month: string;
  date: string;
  firstDate: number;
  secondDate?: number;
};

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
    console.log("Query range:", {start, end});

    const {data: followsData, error: followsError} = await supabase
      .from("follows")
      .select("id, created_at")
      .eq("following_id", profileId)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", {ascending: true});

    if (followsError) {
      return NextResponse.json(
        {error: "Error fetching follows data", details: followsError.message},
        {status: 500},
      );
    }

    return NextResponse.json({
      data: followsData,
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

function getDateRange(range: string, profileCreatedAt: string) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (range) {
    case "Today":
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };

    case "Yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday.toISOString(),
        end: today.toISOString(),
      };
    }

    case "Last 24 hours": {
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: last24Hours.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 7 days": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past 14 days": {
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        start: fourteenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 30 days": {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past Quarter": {
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        start: quarterAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Half Year": {
      const halfYearAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      return {
        start: halfYearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Year": {
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        start: yearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "All Time":
      return {
        start: new Date(profileCreatedAt).toISOString(),
        end: now.toISOString(),
      };

    default:
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
  }
}
