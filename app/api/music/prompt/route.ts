import { NextRequest, NextResponse } from "next/server";
import { requirePackage } from "@/lib/server/packageAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const denied = await requirePackage(req, 'pro');
  if (denied) return denied;

  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, music_prompt } = body;

    if (!id || !music_prompt) {
      return NextResponse.json(
        { error: "id und music_prompt sind erforderlich" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        music_prompt,
        music_status: "pending",
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
