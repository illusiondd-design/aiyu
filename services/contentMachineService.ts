import { generateWithAI, type GeneratedResult } from "@/services/aiService";
import { generateImage, type ImageResult } from "@/services/imageService";
import { generateVideo, type VideoResult } from "@/services/videoService";
import type { AIProvider } from "@/services/aiService";

export type OneClickResult = {
  text: GeneratedResult | null;
  image: ImageResult | null;
  video: VideoResult | null;
};

export async function generateCompleteContent(params: {
  provider: AIProvider;
  companyId: string;
  rawInput: string;
  selectedPlatforms: string[];
  imagePrompt: string;
  videoStyle?: string;
}) {
  // Generate text
  const text = await generateWithAI({
    provider: params.provider,
    companyId: params.companyId,
    rawInput: params.rawInput,
    selectedPlatforms: params.selectedPlatforms,
  });

  const firstPlatform = Object.keys(text.platforms)[0];
  const firstContent = firstPlatform ? text.platforms[firstPlatform] : null;

  // Generate image
  const image = await generateImage({
    prompt: params.imagePrompt,
    size: "1024x1024",
  });

  // Build imageUrl for video generation
  const imageUrl = image?.imageBase64 && image?.mimeType
    ? `data:${image.mimeType};base64,${image.imageBase64}`
    : null;

  // Generate video with image
  const video = await generateVideo({
    companyName: params.companyId,
    hook: text.masterHook,
    story: firstContent?.caption || params.rawInput,
    cta: firstContent?.cta || "Jetzt anfragen",
    style: params.videoStyle || "cinematic fast cuts",
    rawInput: params.rawInput,
    imageUrl: imageUrl, // ← NEW: Pass image to video service
  });

  return {
    text,
    image,
    video,
  };
}
