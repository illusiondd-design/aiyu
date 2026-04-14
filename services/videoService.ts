export type VideoResult = {
  success: boolean;
  script?: string;
  hook?: string;
  main?: string;
  cta?: string;
  hashtags?: string[];
  caption?: string;
  platformCaptions?: Record<string, string>;
  videoUrl?: string;
  videoPath?: string;
  error?: string;
};

export async function generateVideo(params: {
  companyName: string;
  hook: string;
  story: string;
  cta: string;
  style?: string;
  rawInput?: string;
  imageUrl?: string | null; // ← NEW: Accept imageUrl
}): Promise<VideoResult> {
  const response = await fetch("/api/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Fehler bei der Video-Generierung.");
  }

  return data;
}
