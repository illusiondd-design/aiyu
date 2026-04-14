import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .select(`
        id,
        platform,
        review_status,
        video_local_path,
        music_local_path,
        final_reel_path,
        final_status,
        created_at
      `)
      .in("review_status", ["approved", "scheduled", "published"])
      .not("video_local_path", "is", null)
      .not("music_local_path", "is", null)
      .is("final_reel_path", null)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: "Supabase read fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
