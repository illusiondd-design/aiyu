"use client";

import { useEffect, useState } from "react";
import { platforms } from "@/data/platforms";
import { draftService } from "@/services/draftService";
import { storageService } from "@/services/storageService";
import GeneratedOutput from "@/components/GeneratedOutput";
import {
  generateWithAI,
  type AIProvider,
  type GeneratedResult,
} from "@/services/aiService";

export default function ContentInput() {
  const [provider, setProvider] = useState<AIProvider>("claude");
  const [rawInput, setRawInput] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "tiktok",
  ]);
  const [mediaName, setMediaName] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const draft = draftService.getDraft();
    setRawInput(draft.rawInput);
    setSelectedPlatforms(draft.platforms);
    setMediaName(draft.mediaName || "");
  }, []);

  useEffect(() => {
    draftService.saveDraft({
      rawInput,
      platforms: selectedPlatforms,
      mediaName,
    });
  }, [rawInput, selectedPlatforms, mediaName]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((item) => item !== platformId)
        : [...current, platformId]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setMediaName(file?.name || "");
  };

  const handleGenerate = async () => {
    if (!rawInput.trim()) return;

    try {
      setIsGenerating(true);
      setError("");
      setSaveMessage("");

      const companyId = storageService.getSelectedCompany();

      const generated = await generateWithAI({
        provider,
        companyId,
        rawInput,
        selectedPlatforms,
      });

      setResult(generated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToQueue = async () => {
    if (!result) return;

    try {
      setSaveMessage("");
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: result.companyId,
          ideaTitle: result.ideaTitle,
          masterHook: result.masterHook,
          rawInput: result.rawInput,
          platforms: result.platforms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Speichern fehlgeschlagen.");
      }

      setSaveMessage("Erfolgreich in Queue gespeichert.");
      window.dispatchEvent(new Event("postmeister:queue-updated"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    }
  };

  return (
    <>
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Neuer Inhalt
        </h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            AI Provider
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setProvider("claude")}
              className={`rounded-full border px-4 py-2 text-sm ${
                provider === "claude"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              Claude
            </button>

            <button
              type="button"
              onClick={() => setProvider("openai")}
              className={`rounded-full border px-4 py-2 text-sm ${
                provider === "openai"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              OpenAI
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Was ist passiert?
          </label>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Beispiel: Heute Bremsen bei einem BMW gewechselt, Kunde hatte starkes Quietschen."
            className="min-h-[140px] w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Plattformen
          </p>

          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const active = selectedPlatforms.includes(platform.id);

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  {platform.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bild oder Video (optional)
          </label>

          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700"
          />

          {mediaName ? (
            <p className="mt-2 text-sm text-gray-500">
              Ausgewählt: {mediaName}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {saveMessage ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {saveMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating
              ? `${provider === "claude" ? "Claude" : "OpenAI"} generiert...`
              : `Mit ${provider === "claude" ? "Claude" : "OpenAI"} generieren`}
          </button>

          <button
            type="button"
            onClick={handleSaveToQueue}
            disabled={!result}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            In Queue speichern
          </button>

          <span className="text-sm text-gray-500">
            Echte AI-Generierung über {provider === "claude" ? "Claude" : "OpenAI"}.
          </span>
        </div>
      </section>

      <GeneratedOutput result={result} />
    </>
  );
}
