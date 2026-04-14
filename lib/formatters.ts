export function cleanContentLabel(text?: string) {
  if (!text) return "";
  return text
    .replace(/\[HOOK\]\s*/gi, "")
    .replace(/\[MAIN\]\s*/gi, "")
    .replace(/\[CTA\]\s*/gi, "")
    .trim();
}

export function normalizeLineBreaks(text?: string) {
  if (!text) return "";
  return text.replace(/\\n/g, "\n").trim();
}

export function cleanAndFormatText(text?: string) {
  return normalizeLineBreaks(cleanContentLabel(text));
}

export function toAbsoluteVideoUrl(videoUrl?: string) {
  if (!videoUrl) return "";
  if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
    return videoUrl;
  }

  const pipelineBase = process.env.NEXT_PUBLIC_VIDEO_BASE_URL;
  if (!pipelineBase) return videoUrl;

  return `${pipelineBase}${videoUrl}`;
}
