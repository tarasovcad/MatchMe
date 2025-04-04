import {createClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: {user},
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {success: false, message: "Unauthorized"},
      {status: 401},
    );
  }

  const followerId = user.id;
  const {followingId, type} = await req.json();

  if (type === "follow") {
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

  return NextResponse.json({success: true});
}
