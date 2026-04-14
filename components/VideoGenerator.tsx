"use client";

import { useState } from "react";
import { generateVideo, type VideoResult } from "@/services/videoService";
import { storageService } from "@/services/storageService";
import { getCompanyById } from "@/data/companies";
import {
  cleanAndFormatText,
  toAbsoluteVideoUrl,
} from "@/lib/formatters";

export default function VideoGenerator() {
  const [hook, setHook] = useState("");
  const [story, setStory] = useState("");
  const [cta, setCta] = useState("");
  const [style, setStyle] = useState("cinematic fast cuts");
  const [rawInput, setRawInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VideoResult | null>(null);

  const handleGenerateVideo = async () => {
    try {
      setIsGenerating(true);
      setError("");
      setResult(null);

      const companyId = storageService.getSelectedCompany();
      const company = getCompanyById(companyId);

      const video = await generateVideo({
        companyName: company.name,
        hook,
        story,
        cta,
        style,
        rawInput,
      });

      setResult(video);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const videoSrc = toAbsoluteVideoUrl(result?.videoUrl);

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Short / Video erstellen
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hook
          </label>
          <input
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="Bremsen quietschen nicht ohne Grund"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            CTA
          </label>
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="Jetzt Termin anfragen"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Story
        </label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Heute in der Werkstatt: Kunde kam mit starkem Quietschen..."
          className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Stil
          </label>
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="cinematic fast cuts"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rohinput (optional)
          </label>
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Bremsenservice bei BMW mit starkem Quietschen"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateVideo}
          disabled={isGenerating}
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Video wird erstellt..." : "Short generieren"}
        </button>

        <span className="text-sm text-gray-500">
          Übergibt den Prompt an deine Short-Machine.
        </span>
      </div>

      {result ? (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Video-Ergebnis</h3>

          {videoSrc ? (
            <div className="mb-4">
              <video
                controls
                className="w-full rounded-lg border border-gray-200 bg-black"
                src={videoSrc}
              />
            </div>
          ) : null}

          {result.caption ? (
            <div className="mb-3">
              <p className="mb-1 text-sm font-medium text-gray-700">Videotext</p>
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {cleanAndFormatText(result.caption)}
              </p>
            </div>
          ) : null}

          {result.hook ? (
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-medium">Hook:</span>{" "}
              {cleanAndFormatText(result.hook)}
            </p>
          ) : null}

          {result.main ? (
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-medium">Main:</span>{" "}
              {cleanAndFormatText(result.main)}
            </p>
          ) : null}

          {result.cta ? (
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-medium">CTA:</span>{" "}
              {cleanAndFormatText(result.cta)}
            </p>
          ) : null}

          {result.hashtags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
