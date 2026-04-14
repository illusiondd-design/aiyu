import { NextRequest, NextResponse } from "next/server";
import { requirePackage } from "@/lib/server/packageAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const denied = await requirePackage(req, 'ultra');
  if (denied) return denied;

  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, provider, external_post_id, published_url, error_message } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id ist erforderlich" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (provider) updateData.provider = provider;
    if (external_post_id) updateData.external_post_id = external_post_id;
    if (published_url) updateData.published_url = published_url;
    if (error_message !== undefined) updateData.error_message = error_message;

    const { data, error } = await supabaseAdmin
      .from("publish_jobs")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Update fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, job: data?.[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
