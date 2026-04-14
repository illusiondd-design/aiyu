import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function extensionLabel(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".mov")) return "MOV Upload";
  if (lower.endsWith(".mp4")) return "MP4 Upload";
  if (lower.endsWith(".webm")) return "WEBM Upload";
  if (lower.endsWith(".m4v")) return "M4V Upload";
  return "Video Upload";
}

function isUuidLikeToken(token: string) {
  return /^[0-9a-fA-F]{4,12}$/.test(token);
}

function cleanupName(fileName: string) {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  const parts = withoutExt.split("__");
  const rawName = parts.length > 1 ? parts.slice(1).join("__") : withoutExt;

  const normalized = rawName.replace(/[_-]+/g, " ").trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const cleaned = tokens.filter((token) => {
    if (/^\d{13,}$/.test(token)) return false;
    if (/^copy$/i.test(token)) return false;
    if (isUuidLikeToken(token)) return false;
    return true;
  });

  const value = cleaned.join(" ").trim();

  if (!value || /^\d+$/.test(value)) return extensionLabel(fileName);
  return value.slice(0, 80).trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, previewUrl, duration } = body;

    if (!fileName) {
      return NextResponse.json(
        { ok: false, error: "fileName fehlt" },
        { status: 400 }
      );
    }

    const cleanName = cleanupName(fileName);
    const caption = `Upload importiert – bereit zur Weiterbearbeitung.`;
    const videoPrompt = `Erstelle ein kurzes ${duration ? `(${duration}) ` : ""}Reel auf Basis des vorhandenen Uploads "${cleanName}".`;
    const batch_id = `upload-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .insert({
        platform: "instagram",
        format_type: "reel",
        content: caption,
        caption,
        hashtags: [],
        status: "generated",
        review_status: "pending",
        video_prompt: videoPrompt,
        batch_id,
        video_local_path: previewUrl || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      post: data,
      meta: {
        cleanName,
        duration: duration || null,
      },
      message: "Upload erfolgreich in Content-Pipeline übernommen",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
