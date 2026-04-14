import Link from "next/link";
import { PACKAGES } from "@/lib/packages";

const PACKAGE_ORDER = ["starter", "avant", "proship"] as const;

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
          >
            Zurück zum Dashboard
          </Link>
        </div>

        <div className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900">
            Postmeister Pakete
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Wähle das passende Paket für Sichtbarkeit, Automatisierung und
            Content-Leistung.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGE_ORDER.map((key) => {
            const pkg = PACKAGES[key];

            return (
              <section
                key={key}
                className={`rounded-2xl border p-6 shadow-sm ${
                  key === "proship"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    key === "proship" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {pkg.label}
                </p>

                <h2 className="mt-2 text-2xl font-semibold">{pkg.label}</h2>

                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    {(pkg.priceMonthly / 100).toLocaleString("de-DE")} €
                  </span>
                  <span
                    className={`ml-2 text-sm ${
                      key === "proship" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    / Monat
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Videos / Monat</span>
                    <span>{pkg.limits.videos_per_month === -1 ? "Unbegrenzt" : pkg.limits.videos_per_month}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Posts gesamt</span>
                    <span>{pkg.limits.posts_total === -1 ? "Unbegrenzt" : pkg.limits.posts_total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Speicher</span>
                    <span>{pkg.limits.storage_gb} GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Plattformen</span>
                    <span>{pkg.limits.platforms_count === -1 ? "Unbegrenzt" : pkg.limits.platforms_count}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Video Upload</span>
                    <span>{pkg.features.upload_video ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto Musik</span>
                    <span>{pkg.features.auto_music ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto Publish</span>
                    <span>{pkg.features.auto_publish ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics Basic</span>
                    <span>{pkg.features.analytics_basic ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics Advanced</span>
                    <span>{pkg.features.analytics_advanced ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bulk Actions</span>
                    <span>{pkg.features.bulk_actions ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multi Platform</span>
                    <span>{pkg.features.multi_platform ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Priority Queue</span>
                    <span>{pkg.features.priority_queue ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>White Label</span>
                    <span>{pkg.features.white_label ? "Ja" : "Nein"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Access</span>
                    <span>{pkg.features.api_access ? "Ja" : "Nein"}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/upgrade?package=${key}`}
                    className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium ${
                      key === "proship"
                        ? "bg-white text-gray-900"
                        : "bg-gray-900 text-white"
                    }`}
                  >
                    Paket anfragen
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
