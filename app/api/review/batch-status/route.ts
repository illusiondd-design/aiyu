import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const batch_id = searchParams.get("batch_id");

    if (!batch_id) {
      return NextResponse.json(
        { error: "batch_id ist erforderlich" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .select("review_status")
      .eq("batch_id", batch_id);

    if (error) {
      return NextResponse.json(
        { error: "Query fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    const total = data?.length || 0;
    const approved = data?.filter(p => p.review_status === "approved").length || 0;
    const rejected = data?.filter(p => p.review_status === "rejected").length || 0;
    const pending = data?.filter(p => p.review_status === "pending").length || 0;

    return NextResponse.json({ 
      batch_id,
      total,
      approved,
      rejected,
      pending,
      complete: pending === 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
