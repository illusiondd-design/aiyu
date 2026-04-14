import { NextResponse } from "next/server";

function buildVideoPrompt(body: {
  hook?: string;
  story?: string;
  cta?: string;
  style?: string;
  rawInput?: string;
  companyName?: string;
}) {
  const parts = [
    body.companyName ? `Marke/Firma: ${body.companyName}` : "",
    body.hook ? `Hook: ${body.hook}` : "",
    body.story ? `Story: ${body.story}` : "",
    body.cta ? `CTA: ${body.cta}` : "",
    body.rawInput ? `Rohinput: ${body.rawInput}` : "",
    body.style ? `Stil: ${body.style}` : "",
  ].filter(Boolean);

  return parts.join("\n");
}

export async function POST(request: Request) {
  try {
    const pipelineUrl = process.env.VIDEO_PIPELINE_URL;

    if (!pipelineUrl) {
      return NextResponse.json(
        { error: "VIDEO_PIPELINE_URL fehlt in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const prompt = buildVideoPrompt(body);

    if (!prompt) {
      return NextResponse.json(
        { error: "Keine verwertbaren Videodaten übergeben." },
        { status: 400 }
      );
    }

    // Extract imageUrl from body
    const imageUrl = body.imageUrl || null;

    const response = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt,
        imageUrl // ← NEW: Pass imageUrl to Short-Machine
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Video Pipeline Fehler: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
