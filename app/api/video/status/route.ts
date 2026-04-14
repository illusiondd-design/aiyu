import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

async function handleStatusCheck(id: number, video_job_id: string) {
  const apiKey = process.env.PIXVERSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PIXVERSE_API_KEY fehlt" },
      { status: 500 }
    );
  }

  const traceId = crypto.randomUUID();

  const pixverseRes = await fetch(
    `https://app-api.pixverse.ai/openapi/v2/video/result/${video_job_id}`,
    {
      method: "GET",
      headers: {
        "API-KEY": apiKey,
        "Ai-trace-id": traceId,
      },
    }
  );

  const pixverseJson = await pixverseRes.json();

  if (!pixverseRes.ok || pixverseJson?.ErrCode !== 0) {
    await supabaseAdmin
      .from("generated_social_posts")
      .update({
        video_status: "failed",
        video_error: pixverseJson?.ErrMsg || "PixVerse status request fehlgeschlagen",
      })
      .eq("id", id);

    return NextResponse.json(
      {
        error: "PixVerse status request fehlgeschlagen",
        details: pixverseJson,
      },
      { status: 500 }
    );
  }

  const resp = pixverseJson?.Resp || {};
  const status = Number(resp.status);

  let updatePayload: Record<string, string | null> = {
    video_error: null,
  };

  if (status === 1) {
    updatePayload.video_status = "completed";
    updatePayload.video_url = resp.url || null;
    updatePayload.video_completed_at = new Date().toISOString();
  } else if (status === 5) {
    updatePayload.video_status = "processing";
  } else {
    updatePayload.video_status = "failed";
    updatePayload.video_error = resp.fail_reason || `PixVerse status ${status}`;
  }

  const { data, error } = await supabaseAdmin
    .from("generated_social_posts")
    .update(updatePayload)
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json(
      { error: "DB-Update fehlgeschlagen", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: status === 1 ? "completed" : status === 5 ? "processing" : "failed",
    video_url: resp.url || null,
    pixverse: pixverseJson,
    data,
  });
}

// GET: /api/video/status?id=106&video_job_id=123
export async function GET(req: NextRequest) {
  // 🔒 AUTH CHECK
  if (!hasValidSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const video_job_id = searchParams.get("video_job_id");

    if (!id || !video_job_id) {
      return NextResponse.json(
        { error: "id und video_job_id sind erforderlich (als Query-Parameter)" },
        { status: 400 }
      );
    }

    return await handleStatusCheck(Number(id), video_job_id);
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}

// POST: /api/video/status mit Body
export async function POST(req: NextRequest) {
  // 🔒 AUTH CHECK
  if (!hasValidSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, video_job_id } = body;

    if (!id || !video_job_id) {
      return NextResponse.json(
        { error: "id und video_job_id sind erforderlich" },
        { status: 400 }
      );
    }

    return await handleStatusCheck(Number(id), video_job_id);
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
