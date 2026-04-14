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
    const { id, publish_status, published_url } = body;

    if (!id || !publish_status) {
      return NextResponse.json(
        { error: "id und publish_status sind erforderlich" },
        { status: 400 }
      );
    }

    const updateData: any = {
      publish_status,
    };

    if (publish_status === "ready") {
      updateData.publish_target = null;
      updateData.publish_error = null;
      updateData.publish_requested_at = null;
      updateData.publish_completed_at = null;
      updateData.published_url = null;
    } else if (publish_status === "published") {
      updateData.published_url = published_url || `https://example.com/post/${id}`;
      updateData.publish_completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Update fehlgeschlagen", details: error.message },
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
