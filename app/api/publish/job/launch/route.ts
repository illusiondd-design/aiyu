import { NextRequest, NextResponse } from "next/server";
import { requirePackage } from "@/lib/server/packageAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const denied = await requirePackage(req, "ultra");
  if (denied) return denied;

  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { post_id, platform } = body;

    if (!post_id || !platform) {
      return NextResponse.json(
        { error: "post_id und platform sind erforderlich" },
        { status: 400 }
      );
    }

    const { data: existingPost, error: postError } = await supabaseAdmin
      .from("generated_social_posts")
      .select("id, publish_status, final_reel_path")
      .eq("id", post_id)
      .single();

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 });
    }

    if (!existingPost) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    if (!existingPost.final_reel_path) {
      return NextResponse.json(
        { error: "Final Reel fehlt. Publish noch nicht möglich." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("publish_jobs")
      .insert({
        post_id,
        platform,
        status: "queued",
        provider: "manual",
        payload: {
          source: "dashboard_launch",
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("generated_social_posts")
      .update({
        publish_status: "queued",
      })
      .eq("id", post_id);

    return NextResponse.json({
      ok: true,
      status: "success",
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Serverfehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
