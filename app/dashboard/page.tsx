'use client'

import { useEffect, useMemo, useState } from 'react'
import ContentStudio from '@/components/ContentStudio/ContentStudio'
import ContentPipelinePanel from '@/components/dashboard/ContentPipelinePanel'

type PackageType = 'go' | 'pro' | 'ultra'

export default function DashboardPage() {
  const [userPackage, setUserPackage] = useState<PackageType>('pro')

  useEffect(() => {
    fetch('/api/access/context', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const pkg = String(data?.package || '').toLowerCase()
        if (pkg === 'go' || pkg === 'pro' || pkg === 'ultra') {
          setUserPackage(pkg as PackageType)
        }
      })
      .catch(() => {})
  }, [])

  const packageMeta = useMemo(
    () => ({
      go: {
        label: 'GO',
        description: 'Basis-Zugriff auf Studio und einfache Erstellung.',
      },
      pro: {
        label: 'PRO',
        description: 'Studio plus operative Pipeline-Steuerung.',
      },
      ultra: {
        label: 'ULTRA',
        description: 'Volle Steuerung mit Bulk, Publishing und Admin-Funktionen.',
      },
    }),
    []
  )

  const current = packageMeta[userPackage]

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#09101d_35%,#0b1220_100%)] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-10">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03),transparent)]" />
          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.35fr_0.9fr] xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                AIYU · Dashboard
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-5xl xl:text-6xl">
                Content-Produktion passend zum Paket.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Das Dashboard zeigt nur die Bereiche, die für das gewählte Paket relevant sind.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                  Paket
                </div>
                <div className="mt-3 text-lg font-semibold text-white">{current.label}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{current.description}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                  Studio
                </div>
                <div className="mt-3 text-lg font-semibold text-white">Content erstellen</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Upload, Input und Generierung bleiben der erste Einstiegspunkt.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                  Pipeline
                </div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {userPackage === 'go' ? 'Begrenzt' : 'Aktiv'}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Operative Verarbeitung ist paketabhängig verfügbar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8">
          <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-300">
                  Studio
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Content erstellen
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Hier startest du Uploads und Generierungsabläufe.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0a101c]/80 p-3 md:p-4">
              <ContentStudio />
            </div>
          </section>

          {(userPackage === 'pro' || userPackage === 'ultra') && (
            <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-300">
                    Pipeline
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    Produktion & Publishing
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    Operative Übersicht über Posts, Uploads, Musik, Finalisierung und Publishing.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#0b0f17]/85 p-3 md:p-4">
                <ContentPipelinePanel packageType={userPackage} />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
