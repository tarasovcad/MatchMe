import {createClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {followingId, followerId, type} = await req.json();

  const {data: recentNotification} = await supabase
    .from("notifications")
    .select("id, created_at")
    .eq("type", "follow")
    .eq("sender_id", followerId)
    .eq("recipient_id", followingId)
    .order("created_at", {ascending: false})
    .limit(1)
    .single();

  const timeLimit = 24 * 60 * 60 * 1000;
  const now = new Date().getTime();

  if (type === "follow") {
    if (
      !recentNotification ||
      now - new Date(recentNotification.created_at).getTime() > timeLimit
    ) {
      const {error} = await supabase.from("notifications").insert([
        {
          recipient_id: followingId,
          type: "follow",
          sender_id: followerId,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Notification insert error:", error.message);
        return NextResponse.json({success: false}, {status: 500});
      }
    }
  }

  return NextResponse.json({success: true});
}
