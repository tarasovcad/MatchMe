import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {transformCountsForAnalytics} from "@/functions/analytics/analyticsDataTransformation";

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

  const fieldData = data[type as keyof typeof data];

  if (!fieldData || typeof fieldData !== "object" || Array.isArray(fieldData)) {
    return NextResponse.json([], {status: 200});
  }

  const rawCounts = fieldData as Record<string, number>;
  let transformed = transformCountsForAnalytics(rawCounts, type);

  if (type === "skill_counts") {
    const skillNames = Object.keys(rawCounts);

    if (skillNames.length > 0) {
      const {data: skillsData, error: skillsError} = await supabase
        .from("skills")
        .select("name, image_url")
        .in("name", skillNames);

      if (!skillsError && skillsData) {
        const skillImageMap = skillsData.reduce(
          (acc, skill) => {
            acc[skill.name] = skill.image_url;
            return acc;
          },
          {} as Record<string, string>,
        );

        transformed = transformed.map((item) => ({
          ...item,
          image: skillImageMap[item.label] || undefined,
        }));
      }
    }
  }

  return NextResponse.json(transformed);
}
