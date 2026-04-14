import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, review_status } = body;

    if (!id || !review_status) {
      return NextResponse.json(
        { error: "id und review_status sind erforderlich" },
        { status: 400 }
      );
    }

    const allowed = ["draft", "approved", "rejected", "scheduled", "published"];
    if (!allowed.includes(review_status)) {
      return NextResponse.json(
        { error: "Ungültiger review_status" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, string | null> = {
      review_status,
      approved_at: review_status === "approved" ? new Date().toISOString() : null,
      rejected_at: review_status === "rejected" ? new Date().toISOString() : null,
      published_at: review_status === "published" ? new Date().toISOString() : null,
    };

    const res = await fetch(
      "https://zppfvvkeyhzcwruewfvz.supabase.co/rest/v1/generated_social_posts?id=eq." + id,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updatePayload),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Supabase update fehlgeschlagen", details: text },
        { status: res.status }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
