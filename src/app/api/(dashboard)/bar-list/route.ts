import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

type CountData = Record<string, number>;

interface TransformedItem {
  label: string;
  count: number;
  percentage: number;
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
  const total = Object.values(rawCounts).reduce((sum, count) => sum + count, 0);

  const transformed: TransformedItem[] = Object.entries(rawCounts)
    .map(([key, value]) => ({
      label: key,
      count: value,
      percentage: parseFloat(((value / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(transformed);
}
