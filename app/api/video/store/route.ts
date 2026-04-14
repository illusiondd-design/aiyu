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
    const formData = await req.formData();

    const idRaw = formData.get("id");
    const platformRaw = formData.get("platform");
    const file = formData.get("file");

    if (!idRaw || !file) {
      return NextResponse.json(
        { error: "id und file sind erforderlich" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file ist keine gültige Datei" },
        { status: 400 }
      );
    }

    const id = Number(idRaw);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: "id ist ungültig" },
        { status: 400 }
      );
    }

    const platform = sanitizeFilePart(String(platformRaw || "video"));
    const bytes = Buffer.from(await file.arrayBuffer());

    const filename = `${platform}_post_${id}_${Date.now()}.mp4`;
    const relativePath = path.join("storage", "generated_videos", filename);
    const absolutePath = path.join(process.cwd(), relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, bytes);

    const { data, error } = await supabaseAdmin
      .from("generated_social_posts")
      .update({
        video_local_path: relativePath,
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
      saved_path: relativePath,
      bytes: bytes.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(error) },
      { status: 500 }
    );
  }
}
