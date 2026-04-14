import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, music_local_path } = body;

    if (!id || !music_local_path) {
      return NextResponse.json(
        { error: "id und music_local_path sind erforderlich" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        music_local_path,
        music_status: "completed",
        music_error: null,
      })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "DB-Update fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
