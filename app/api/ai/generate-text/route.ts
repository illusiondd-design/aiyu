import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen2.5:7b';

async function callOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Ollama error:', error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, input, platform = 'instagram' } = body;

    let prompt = '';
    let variations: string[] = [];

    switch (type) {
      case 'caption':
        prompt = `Du bist ein Social Media Expert. Schreibe 3 verschiedene Instagram Captions für diesen Content: "${input}". Jede Caption sollte:
- Kurz und knackig sein (max 2-3 Sätze)
- Emojis enthalten
- Call-to-Action haben
- Auf Deutsch sein

Format: Eine Caption pro Zeile, getrennt durch ---

Caption 1:
Caption 2:
Caption 3:`;
        break;

      case 'hashtags':
        prompt = `Du bist ein Social Media Expert. Generiere 3 verschiedene Hashtag-Sets für diesen Instagram Content: "${input}". Jedes Set sollte:
- 5-8 relevante Hashtags haben
- Mix aus populären und Nischen-Hashtags
- Auf Deutsch sein

Format: Ein Set pro Zeile, getrennt durch ---

Set 1:
Set 2:
Set 3:`;
        break;

      case 'cta':
        prompt = `Du bist ein Social Media Expert. Schreibe 3 verschiedene Call-to-Actions für diesen Instagram Content: "${input}". Jede CTA sollte:
- Kurz sein (1-2 Zeilen)
- Mit Emoji starten
- Action-orientiert sein
- Auf Deutsch sein

Format: Eine CTA pro Zeile, getrennt durch ---

CTA 1:
CTA 2:
CTA 3:`;
        break;

      case 'full':
        prompt = `Du bist ein Social Media Expert. Erstelle einen KOMPLETTEN Instagram Post für: "${input}".

Der Post sollte enthalten:
- Eine knackige Caption (2-3 Sätze mit Emojis)
- 6-8 relevante Hashtags
- Eine Call-to-Action
- Alles auf Deutsch

Schreibe den kompletten Post:`;
        break;

      default:
        return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 });
    }

    const response = await callOllama(prompt);

    if (type === 'full') {
      return NextResponse.json({
        ok: true,
        result: response.trim(),
        variations: [],
        type,
      });
    }

    // Parse variations (split by ---)
    const parts = response.split('---').map(p => p.trim()).filter(p => p.length > 0);
    variations = parts.slice(0, 3);

    return NextResponse.json({
      ok: true,
      result: variations[0] || response,
      variations,
      type,
    });
  } catch (error) {
    console.error('AI generate text error:', error);
    return NextResponse.json({ ok: false, error: 'Server Error' }, { status: 500 });
  }
}
