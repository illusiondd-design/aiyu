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
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!batch_id) {
      return NextResponse.json(
        { error: "batch_id ist erforderlich" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .select("*")
      .eq("batch_id", batch_id)
      .order("post_index", { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: "Query fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, review_status, reviewer_note } = body;

    if (!id || !review_status) {
      return NextResponse.json(
        { error: "id und review_status sind erforderlich" },
        { status: 400 }
      );
    }

    const updateData: any = {
      review_status,
    };

    if (review_status === "approved") {
      updateData.approved_at = new Date().toISOString();
    } else if (review_status === "rejected") {
      updateData.rejected_at = new Date().toISOString();
    }

    if (reviewer_note) {
      updateData.reviewer_note = reviewer_note;
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
