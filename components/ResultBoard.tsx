'use client'

import { useEffect, useState } from 'react'

export type ShortStatus = 'ready' | 'processing' | 'review' | 'error'

export type ShortItem = {
  id: string
  title: string
  hook: string
  status: ShortStatus
  duration: string
  platform: string
  caption?: string
  cta?: string
  hashtags?: string[]
  previewUrl?: string
  downloadUrl?: string
}

function statusStyle(status: ShortStatus) {
  switch (status) {
    case 'ready':
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
    case 'processing':
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
    case 'review':
      return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
    case 'error':
      return 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
    default:
      return 'bg-white/10 text-slate-300 border border-white/10'
  }
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\-_ ]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function ResultBoard({ items = [] }: { items?: ShortItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<ShortItem | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const total = items.length
  const ready = items.filter((i) => i.status === 'ready').length
  const processing = items.filter((i) => i.status === 'processing').length
  const review = items.filter((i) => i.status === 'review').length

  useEffect(() => {
    if (!activeItem) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveItem(null)
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeItem])

  const handleDownload = (item: ShortItem) => {
    if (!item.downloadUrl) return

    const link = document.createElement('a')
    link.href = item.downloadUrl
    link.download = `${safeFilename(item.title || item.hook || 'upload')}.mp4`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleProcess = async (item: ShortItem) => {
    try {
      setProcessingId(item.id)

      const res = await fetch('/api/uploads/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: item.id,
          previewUrl: item.previewUrl,
          duration: item.duration,
        }),
      })

      const data = await res.json()

      if (data.ok) {
        alert('In Content-Pipeline übernommen')
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      alert('Fehler bei der Weiterverarbeitung')
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
            Ergebnisse
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Uploads Übersicht
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Hochgeladene Dateien mit Vorschau, Detailansicht und Download.
          </p>
        </div>

        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
          {total} Uploads sichtbar
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm text-slate-400">Gesamt</div>
          <div className="mt-2 text-2xl font-semibold text-white">{total}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm text-slate-400">Fertig</div>
          <div className="mt-2 text-2xl font-semibold text-white">{ready}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm text-slate-400">In Arbeit</div>
          <div className="mt-2 text-2xl font-semibold text-white">{processing}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm text-slate-400">Prüfen</div>
          <div className="mt-2 text-2xl font-semibold text-white">{review}</div>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-400">
          Noch keine Uploads vorhanden.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isOpen = openId === item.id

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.title}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-white">
                      {item.hook}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDownload(item)}
                    disabled={!item.downloadUrl}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Download"
                  >
                    Download
                  </button>
                </div>

                <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <div className="flex aspect-[9/16] items-center justify-center text-sm text-slate-500">
                    {item.previewUrl ? (
                      <video
                        src={item.previewUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      'Keine Vorschau'
                    )}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(item.status)}`}>
                    {item.status}
                  </span>

                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
                    {item.platform}
                  </span>

                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
                    {item.duration}
                  </span>
                </div>

                {item.caption ? (
                  <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">
                    {item.caption}
                  </p>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleProcess(item)}
                    disabled={processingId === item.id}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {processingId === item.id ? 'Läuft...' : 'Weiterverarbeiten'}
                  </button>

                  <button
                    onClick={() => setActiveItem(item)}
                    className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black"
                  >
                    Öffnen
                  </button>

                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300"
                  >
                    {isOpen ? 'Schließen' : 'Details'}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Caption
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {item.caption || 'Keine Caption vorhanden.'}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        CTA
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {item.cta || 'Kein CTA vorhanden.'}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Hashtags
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(item.hashtags || []).length > 0 ? (
                          item.hashtags!.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">
                            Keine Hashtags vorhanden.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {activeItem.title}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {activeItem.hook}
                </h3>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300"
              >
                Schließen
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-sm uppercase tracking-[0.18em] text-slate-400">
                  Vorschau
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <div className="flex aspect-[9/16] items-center justify-center text-sm text-slate-500">
                    {activeItem.previewUrl ? (
                      <video
                        src={activeItem.previewUrl}
                        className="h-full w-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      'Keine Vorschau'
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(activeItem.status)}`}>
                    {activeItem.status}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {activeItem.platform}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {activeItem.duration}
                  </span>
                </div>
              </div>

              <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Caption
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    {activeItem.caption || 'Keine Caption vorhanden.'}
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    CTA
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    {activeItem.cta || 'Kein CTA vorhanden.'}
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Hashtags
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(activeItem.hashtags || []).length > 0 ? (
                      activeItem.hashtags!.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        Keine Hashtags vorhanden.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleDownload(activeItem)}
                    disabled={!activeItem.downloadUrl}
                    className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => handleProcess(activeItem)}
                    disabled={processingId === activeItem.id}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {processingId === activeItem.id ? 'Läuft...' : 'Weiterverarbeiten'}
                  </button>
                </div>

                {!activeItem.downloadUrl ? (
                  <p className="text-sm text-amber-300">
                    Keine Download-Datei hinterlegt.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
