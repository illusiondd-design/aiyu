import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

function buildHookFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/__/g, " — ");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Keine Datei empfangen" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "upload.bin";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(safeName).toLowerCase();

    const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const videoExts = [".mp4", ".mov", ".webm", ".m4v"];

    let targetDir = "";
    let fileType = "";

    if (imageExts.includes(ext)) {
      targetDir = path.join(process.cwd(), "storage/uploads/images");
      fileType = "image";
    } else if (videoExts.includes(ext)) {
      targetDir = path.join(process.cwd(), "storage/uploads/videos");
      fileType = "video";
    } else {
      return NextResponse.json(
        { success: false, error: "Dateityp nicht erlaubt" },
        { status: 400 }
      );
    }

    await mkdir(targetDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const finalName = `${timestamp}__${safeName}`;
    const finalPath = path.join(targetDir, finalName);
    const fileUrl = `/api/uploads/file/${encodeURIComponent(finalName)}`;

    await writeFile(finalPath, buffer);

    return NextResponse.json({
      success: true,
      fileType,
      fileName: finalName,
      storedAt: finalPath,
      title: finalName,
      hook: buildHookFromFilename(finalName),
      previewUrl: fileUrl,
      downloadUrl: fileUrl,
    });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Upload fehlgeschlagen" },
      { status: 500 }
    );
  }
}
