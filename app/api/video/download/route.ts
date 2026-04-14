import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import fs from "node:fs/promises";
import path from "node:path";

function sanitizeFilePart(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, video_url, platform } = body;

    if (!id || !video_url) {
      return NextResponse.json(
        { error: "id und video_url sind erforderlich" },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json(
        { error: "id ist ungültig" },
        { status: 400 }
      );
    }

    const { data: existing, error: readError } = await supabaseAdmin
      .from("generated_social_posts")
      .select("id, video_local_path")
      .eq("id", numericId)
      .single();

    if (readError) {
      return NextResponse.json(
        { error: "Post konnte nicht geladen werden", details: readError.message },
        { status: 500 }
      );
    }

    if (existing?.video_local_path) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "already_stored",
        saved_path: existing.video_local_path,
      });
    }

    const res = await fetch(video_url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Video-Download fehlgeschlagen", details: `HTTP ${res.status}` },
        { status: 500 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safePlatform = sanitizeFilePart(platform || "video");
    const filename = `${safePlatform}_post_${numericId}_${Date.now()}.mp4`;
    const relativePath = path.join("storage", "generated_videos", filename);
    const absolutePath = path.join(process.cwd(), relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        video_local_path: relativePath,
      })
      .eq("id", numericId)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "DB-Update fehlgeschlagen", details: error.message, saved_path: relativePath },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved_path: relativePath,
      bytes: buffer.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
