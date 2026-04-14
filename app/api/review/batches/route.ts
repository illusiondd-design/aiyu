import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "200");

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .select("batch_id, created_at, review_status")
      .eq("review_status", status)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: "Query fehlgeschlagen", details: error.message },
        { status: 500 }
      );
    }

    // Group by batch_id
    const batches = new Map();
    data?.forEach(post => {
      if (!batches.has(post.batch_id)) {
        batches.set(post.batch_id, {
          batch_id: post.batch_id,
          created_at: post.created_at,
          count: 0
        });
      }
      const batch = batches.get(post.batch_id);
      batch.count++;
    });

    return NextResponse.json({ 
      batches: Array.from(batches.values()) 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
