import { NextRequest, NextResponse } from "next/server";
import { requirePackage } from "@/lib/server/packageAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasValidSession } from "@/lib/auth/session";

function normalizeVideoPrompt(input: string): string {
  const raw = String(input || "").trim();

  if (!raw) {
    return "professional car workshop, mechanic repairing a car, cinematic lighting";
  }

  let prompt = raw;
  prompt = prompt.replace(/\s+/g, " ").trim();

  if (prompt.length > 300) {
    prompt = prompt.slice(0, 300).trim();
  }

  return prompt || "professional car workshop, mechanic repairing a car, cinematic lighting";
}

function makeTraceId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().toLowerCase()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function callPixVerse(apiKey: string, payload: Record<string, unknown>) {
  const traceId = makeTraceId();

  const res = await fetch("https://app-api.pixverse.ai/openapi/v2/video/text/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-KEY": apiKey,
      "Ai-trace-id": traceId,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return { res, json, traceId, payload };
}

export async function POST(req: NextRequest) {
  const denied = await requirePackage(req, 'pro');
  if (denied) return denied;

  // 🔒 AUTH CHECK
  if (!hasValidSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, video_prompt } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id ist erforderlich" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PIXVERSE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "PIXVERSE_API_KEY fehlt" },
        { status: 500 }
      );
    }

    const normalizedPrompt = normalizeVideoPrompt(video_prompt);
    const randomSeed = Math.floor(Math.random() * 2147483647);

    const attempts: Array<{
      name: string;
      payload: Record<string, unknown>;
      ok?: boolean;
      errCode?: number | null;
      errMsg?: string | null;
      httpStatus?: number;
      traceId?: string;
    }> = [];

    // Versuch 1: Vollständiger Payload mit aspect_ratio
    const payload1 = {
      prompt: normalizedPrompt,
      model: "v3.5",
      duration: 5,
      quality: "540p",
      aspect_ratio: "9:16",
      motion_mode: "normal",
      seed: randomSeed,
    };

    const attempt1 = await callPixVerse(apiKey, payload1);
    attempts.push({
      name: "with_quality_and_seed",
      payload: payload1,
      ok: attempt1.res.ok && attempt1.json?.ErrCode === 0,
      errCode: attempt1.json?.ErrCode ?? null,
      errMsg: attempt1.json?.ErrMsg ?? null,
      httpStatus: attempt1.res.status,
      traceId: attempt1.traceId,
    });

    let success = attempt1;

    // Versuch 2: Minimal-Payload mit aspect_ratio
    if (!(attempt1.res.ok && attempt1.json?.ErrCode === 0)) {
      const payload2 = {
        prompt: normalizedPrompt,
        model: "v3.5",
        duration: 5,
        aspect_ratio: "9:16",
      };

      const attempt2 = await callPixVerse(apiKey, payload2);
      attempts.push({
        name: "minimal_payload",
        payload: payload2,
        ok: attempt2.res.ok && attempt2.json?.ErrCode === 0,
        errCode: attempt2.json?.ErrCode ?? null,
        errMsg: attempt2.json?.ErrMsg ?? null,
        httpStatus: attempt2.res.status,
        traceId: attempt2.traceId,
      });

      success = attempt2;
    }

    if (!(success.res.ok && success.json?.ErrCode === 0)) {
      await supabaseAdmin
        .from("generated_social_posts")
        .update({
          video_prompt: normalizedPrompt,
          video_status: "failed",
          video_error: success.json?.ErrMsg || "PixVerse request fehlgeschlagen",
          video_requested_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json(
        {
          error: "PixVerse request fehlgeschlagen",
          details: success.json,
          attempts,
        },
        { status: 500 }
      );
    }

    const videoJobId = String(success.json.Resp.video_id);

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        video_prompt: normalizedPrompt,
        video_status: "processing",
        video_job_id: videoJobId,
        video_error: null,
        video_requested_at: new Date().toISOString(),
      })
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
      video_job_id: videoJobId,
      pixverse: success.json,
      attempts,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
