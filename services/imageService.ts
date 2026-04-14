export type ImageResult = {
  imageBase64?: string;
  mimeType?: string;
  revisedPrompt?: string;
  error?: string;
};

export async function generateImage(params: {
  prompt: string;
  size?: string;
}): Promise<ImageResult> {
  const response = await fetch("/api/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Fehler bei der Bild-Generierung.");
  }

  return data;
}
