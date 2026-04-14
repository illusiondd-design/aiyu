import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .select("id, platform, content, caption, hashtags, batch_id, review_status, scheduled_for, created_at, published_at")
      .eq("review_status", "scheduled")
      .not("scheduled_for", "is", null)
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: "Supabase read fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
