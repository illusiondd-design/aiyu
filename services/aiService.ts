export type AIProvider = "claude" | "openai";

export type GeneratedPlatformContent = {
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
};

export type GeneratedResult = {
  ideaTitle: string;
  masterHook: string;
  companyId: string;
  rawInput: string;
  platforms: Record<string, GeneratedPlatformContent>;
};

export async function generateWithAI(params: {
  provider: AIProvider;
  companyId: string;
  rawInput: string;
  selectedPlatforms: string[];
}): Promise<GeneratedResult> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Fehler bei der AI-Generierung.");
  }

  return data;
}
