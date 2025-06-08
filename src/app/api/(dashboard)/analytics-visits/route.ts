import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

interface TransformedItem {
  label: string;
  count: number;
  percentage: number; // of total views
  relative: number; // 0-100, scaled to the max
  fill?: string; // HSL color variable (optional)
}

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const table = searchParams.get("table");
  const ownerId = table === "profile_visits" ? "profile_owner_id" : "project_owner_id";

  if (!id || !type || !table) {
    return NextResponse.json({error: "Id, type, and table are required"}, {status: 400});
  }

  const supabase = await createClient();
  const {data, error} = await supabase.from(table).select(type).eq(ownerId, id).single();

  if (error || !data) {
    return NextResponse.json({error: error?.message || "Data not found"}, {status: 500});
  }

  const rawCounts = data[type as keyof typeof data];

  if (!rawCounts || Object.keys(rawCounts).length === 0) {
    return NextResponse.json([], {status: 200});
  }

  const total = Object.values(rawCounts).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(rawCounts));

  const chartColorTypes = ["age_distribution", "pronoun_counts"];

  const transformed: TransformedItem[] = Object.entries(rawCounts)
    .map(([key, count]) => ({
      label: key,
      count: count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)), // share of total
      relative: parseFloat(((count / maxCount) * 100).toFixed(1)), // scaled to biggest bar
    }))
    .sort((a, b) => b.count - a.count)
    .map((item, index) => ({
      ...item,
      fill: chartColorTypes.includes(type) ? `hsl(var(--chart-${index + 1}))` : undefined,
    }));

  return NextResponse.json(transformed);
}
