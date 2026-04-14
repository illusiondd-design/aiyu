"use client";

import { useState } from "react";
import { generateImage, type ImageResult } from "@/services/imageService";
import { storageService } from "@/services/storageService";
import { getCompanyById } from "@/data/companies";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImageResult | null>(null);

  const handlePrefill = () => {
    const companyId = storageService.getSelectedCompany();
    const company = getCompanyById(companyId);

    const prefill = `${company.name}, ${company.industry}, modernes Marketingbild, hochwertige Werbeaufnahme, klarer Fokus, starke Lichtstimmung, professionell, social-media-tauglich`;
    setPrompt(prefill);
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setError("");
      setResult(null);

      const image = await generateImage({
        prompt,
        size,
      });

      setResult(image);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const imageSrc =
    result?.imageBase64 && result?.mimeType
      ? `data:${result.mimeType};base64,${result.imageBase64}`
      : "";

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Bild erstellen
      </h2>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Bildprompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Beispiel: Moderne KFZ-Werkstatt, Mechaniker bei der Diagnose, cinematic lighting, hochwertige Werbeaufnahme"
          className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Größe
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
          >
            <option value="1024x1024">1024x1024</option>
            <option value="1536x1024">1536x1024</option>
            <option value="1024x1536">1024x1536</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handlePrefill}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
          >
            Prompt aus Mandant vorfüllen
          </button>
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
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Bild wird erstellt..." : "Bild generieren"}
        </button>

        <span className="text-sm text-gray-500">
          OpenAI Bildgenerierung direkt aus Postmeister.
        </span>
      </div>

      {result ? (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Bild-Ergebnis</h3>

          {imageSrc ? (
            <div className="mb-4">
              <img
                src={imageSrc}
                alt="Generiertes Bild"
                className="w-full rounded-lg border border-gray-200"
              />
            </div>
          ) : null}

          {result.revisedPrompt ? (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">
                Überarbeiteter Prompt
              </p>
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {result.revisedPrompt}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
