import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, size = "1024x1024" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt ist erforderlich." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt,
        size,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI Image API Fehler: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    const firstImage = data?.data?.[0];
    const imageBase64 = firstImage?.b64_json;
    const revisedPrompt = firstImage?.revised_prompt || "";

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Keine Bilddaten von OpenAI erhalten." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageBase64,
      mimeType: "image/png",
      revisedPrompt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
