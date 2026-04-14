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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id ist erforderlich" },
        { status: 400 }
      );
    }

    // Placeholder - echte Compose-Logik später
    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        final_status: "processing",
      })
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
