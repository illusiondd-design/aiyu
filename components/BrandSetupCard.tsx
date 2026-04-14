"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type BrandProfile = {
  industry: string;
  short_description: string;
  location?: string | null;
  website?: string | null;
  services?: string | null;
  style_notes?: string | null;
  setup_completed?: boolean;
};

type BrandAsset = {
  id: string;
  asset_type: "logo" | "image" | "video";
  file_url: string;
  is_primary: boolean;
};

const INDUSTRY_OPTIONS = [
  { value: "handwerk", label: "Handwerk" },
  { value: "kfz_werkstatt", label: "KFZ / Werkstatt" },
  { value: "bau_ausbau", label: "Bau / Ausbau" },
  { value: "immobilien", label: "Immobilien" },
  { value: "gastronomie", label: "Gastronomie" },
  { value: "beauty_kosmetik", label: "Beauty / Kosmetik" },
  { value: "gesundheit_therapie", label: "Gesundheit / Therapie" },
  { value: "fitness_sport", label: "Fitness / Sport" },
  { value: "einzelhandel", label: "Einzelhandel" },
  { value: "e_commerce", label: "E-Commerce" },
  { value: "beratung_coaching", label: "Beratung / Coaching" },
  { value: "bildung_training", label: "Bildung / Training" },
  { value: "finanzen_versicherung", label: "Finanzen / Versicherung" },
  { value: "it_technik", label: "IT / Technik" },
  { value: "reinigung_service", label: "Reinigung / Service" },
  { value: "event_hochzeit", label: "Event / Hochzeit" },
  { value: "fotografie_kreativ", label: "Fotografie / Kreativ" },
  { value: "industrie_produktion", label: "Industrie / Produktion" },
  { value: "vereine_organisationen", label: "Vereine / Organisationen" },
  { value: "sonstiges", label: "Sonstiges" },
];

export default function BrandSetupCard() {
  const [form, setForm] = useState<BrandProfile>({
    industry: "",
    short_description: "",
    location: "",
    website: "",
    services: "",
    style_notes: "",
    setup_completed: false,
  });

  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logos = useMemo(
    () => assets.filter((asset) => asset.asset_type === "logo"),
    [assets]
  );

  const images = useMemo(
    () => assets.filter((asset) => asset.asset_type === "image"),
    [assets]
  );

  const videos = useMemo(
    () => assets.filter((asset) => asset.asset_type === "video"),
    [assets]
  );

  const hasLogo = logos.length >= 1;
  const hasEnoughImages = images.length >= 3;
  const missingImages = Math.max(0, 3 - images.length);
  const setupRequirementsMet = hasLogo && hasEnoughImages;

  const setupProgress = useMemo(() => {
    let score = 0;
    if (form.industry) score += 1;
    if (form.short_description?.trim()) score += 1;
    if (hasLogo) score += 1;
    if (hasEnoughImages) score += 1;
    return Math.round((score / 4) * 100);
  }, [form.industry, form.short_description, hasLogo, hasEnoughImages]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [profileRes, assetsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/brand-assets"),
      ]);

      const profileJson = await profileRes.json();
      const assetsJson = await assetsRes.json();

      if (!profileRes.ok) {
        throw new Error(profileJson.error || "Brand-Profil konnte nicht geladen werden.");
      }

      if (!assetsRes.ok) {
        throw new Error(assetsJson.error || "Brand-Assets konnten nicht geladen werden.");
      }

      if (profileJson.profile) {
        setForm({
          industry: profileJson.profile.industry || "",
          short_description: profileJson.profile.short_description || "",
          location: profileJson.profile.location || "",
          website: profileJson.profile.website || "",
          services: profileJson.profile.services || "",
          style_notes: profileJson.profile.style_notes || "",
          setup_completed: profileJson.profile.setup_completed || false,
        });
      }

      setAssets(assetsJson.assets || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange =
    (field: keyof BrandProfile) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      if (!form.industry) {
        throw new Error("Bitte eine Branche auswählen.");
      }

      if (!form.short_description?.trim()) {
        throw new Error("Bitte eine Kurzbeschreibung eingeben.");
      }

      const response = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry: form.industry,
          short_description: form.short_description,
          location: form.location || null,
          website: form.website || null,
          services: form.services || null,
          style_notes: form.style_notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Brand-Profil konnte nicht gespeichert werden.");
      }

      setForm((current) => ({
        ...current,
        setup_completed: true,
      }));

      setSuccess("Firmenprofil erfolgreich gespeichert.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFile = async (
    file: File,
    assetType: "logo" | "image",
    isPrimary: boolean
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("asset_type", assetType);
    formData.append("is_primary", String(isPrimary));

    const response = await fetch("/api/brand-assets/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload fehlgeschlagen.");
    }

    return data.asset as BrandAsset;
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      setError("");
      setSuccess("");

      await uploadFile(file, "logo", true);
      await loadData();

      setSuccess("Logo erfolgreich hochgeladen.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setError("");
      setSuccess("");

      for (const file of files) {
        await uploadFile(file, "image", false);
      }

      await loadData();
      setSuccess("Referenzbilder erfolgreich hochgeladen.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      setActiveAssetId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/brand-assets?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Asset konnte nicht gelöscht werden.");
      }

      await loadData();
      setSuccess("Asset erfolgreich gelöscht.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setActiveAssetId(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      setActiveAssetId(id);
      setError("");
      setSuccess("");

      const response = await fetch("/api/brand-assets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Asset konnte nicht als primär gesetzt werden.");
      }

      await loadData();
      setSuccess("Primärlogo erfolgreich gesetzt.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setActiveAssetId(null);
    }
  };

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Firmen-Setup</h2>
          <p className="mt-1 text-sm text-gray-600">
            Branche, Kurzbeschreibung und visuelle Basis für deine Content-Machine.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          <p className="text-gray-500">Setup-Status</p>
          <p className="mt-1 font-semibold text-gray-900">{setupProgress}% vollständig</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      {!setupRequirementsMet ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Qualitätswarnung</p>
          <div className="mt-2 space-y-1">
            {!hasLogo ? <p>• Es fehlt noch ein Logo.</p> : null}
            {!hasEnoughImages ? (
              <p>• Es fehlen noch {missingImages} Referenzbild{missingImages === 1 ? "" : "er"} für die empfohlene Mindestqualität.</p>
            ) : null}
          </div>
          <p className="mt-2 text-amber-700">
            Für stabile und markengerechte Ergebnisse empfehlen wir mindestens 1 Logo und 3 Referenzbilder.
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Qualitätsstatus</p>
          <p className="mt-2">
            Die empfohlene Mindestbasis ist erfüllt: 1 Logo und mindestens 3 Referenzbilder sind vorhanden.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Firmenprofil wird geladen...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Branche *
              </label>
              <select
                value={form.industry}
                onChange={handleChange("industry")}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
              >
                <option value="">Bitte wählen</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Standort
              </label>
              <input
                value={form.location || ""}
                onChange={handleChange("location")}
                placeholder="z. B. Dresden"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kurzbeschreibung *
            </label>
            <textarea
              value={form.short_description}
              onChange={handleChange("short_description")}
              placeholder="Beschreibe kurz dein Unternehmen, deine Leistungen und deinen Fokus."
              className="min-h-[110px] w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                value={form.website || ""}
                onChange={handleChange("website")}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Leistungen
              </label>
              <input
                value={form.services || ""}
                onChange={handleChange("services")}
                placeholder="z. B. Wartung, Reparatur, Diagnose"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Stilhinweise
            </label>
            <textarea
              value={form.style_notes || ""}
              onChange={handleChange("style_notes")}
              placeholder="z. B. modern, technisch, vertrauenswürdig, lokal, hochwertig"
              className="min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-gray-500"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Logo</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{logos.length}</p>
              <p className="mt-1 text-sm text-gray-600">
                {hasLogo ? "Pflicht erfüllt" : "Mindestens 1 Logo benötigt"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Referenzbilder</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{images.length}</p>
              <p className="mt-1 text-sm text-gray-600">
                {images.length >= 3 ? "Pflicht erfüllt" : "Mindestens 3 benötigt"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Videos</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{videos.length}</p>
              <p className="mt-1 text-sm text-gray-600">Optional für V1</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Logo hochladen</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
                className="block w-full text-sm text-gray-700"
              />
              <p className="mt-2 text-sm text-gray-500">
                Empfohlen: 1 primäres Logo.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Referenzbilder hochladen</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                disabled={isUploadingImages}
                className="block w-full text-sm text-gray-700"
              />
              <p className="mt-2 text-sm text-gray-500">
                Mindestens 3 Bilder für bessere Content-Qualität.
              </p>
            </div>
          </div>

          {logos.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-gray-900">Aktuelle Logos</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {logos.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-gray-200 p-3">
                    <img
                      src={asset.file_url}
                      alt="Logo"
                      className="h-32 w-full rounded-md object-contain bg-gray-50"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {asset.is_primary ? "Primärlogo" : "Logo"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {!asset.is_primary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(asset.id)}
                          disabled={activeAssetId === asset.id}
                          className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700"
                        >
                          Als primär setzen
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={activeAssetId === asset.id}
                        className="rounded-md border border-red-300 px-3 py-2 text-xs text-red-700"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {images.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-gray-900">Referenzbilder</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {images.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-gray-200 p-3">
                    <img
                      src={asset.file_url}
                      alt="Referenzbild"
                      className="h-40 w-full rounded-md object-cover bg-gray-50"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={activeAssetId === asset.id}
                        className="rounded-md border border-red-300 px-3 py-2 text-xs text-red-700"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Speichert..." : "Firmenprofil speichern"}
            </button>

            <button
              type="button"
              onClick={loadData}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
            >
              Neu laden
            </button>
          </div>
        </>
      )}
    </section>
  );
}
