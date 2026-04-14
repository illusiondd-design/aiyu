'use client'

import { useEffect, useState } from 'react'

type UpgradeRequest = {
  id: number | string
  email?: string | null
  requested_package?: string | null
  message?: string | null
  status?: string | null
  created_at?: string | null
}

export default function AdminUpgradesPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadRequests() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/upgrade-requests', { cache: 'no-store' })
      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Upgrade-Requests konnten nicht geladen werden.')
      }

      setRequests(json.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function act(id: string | number, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/admin/upgrade-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Aktion fehlgeschlagen.')
      }

      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#09101d_35%,#0b1220_100%)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Admin · Upgrade Requests
          </div>
          <h1 className="text-3xl font-semibold">Upgrade-Anfragen</h1>
          <p className="mt-2 text-sm text-slate-400">
            Offene Anfragen prüfen, freigeben oder ablehnen.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Anfragen</h2>
            <button
              onClick={loadRequests}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm"
            >
              Neu laden
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-400">Lade Anfragen ...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-400">
                    <th className="px-3 py-3">E-Mail</th>
                    <th className="px-3 py-3">Zielpaket</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Nachricht</th>
                    <th className="px-3 py-3">Erstellt</th>
                    <th className="px-3 py-3">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((row) => (
                    <tr key={String(row.id)} className="border-b border-white/5">
                      <td className="px-3 py-3">{row.email || '-'}</td>
                      <td className="px-3 py-3">{row.requested_package || '-'}</td>
                      <td className="px-3 py-3">{row.status || '-'}</td>
                      <td className="px-3 py-3">{row.message || '-'}</td>
                      <td className="px-3 py-3">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => act(row.id, 'approve')}
                            className="rounded-xl bg-emerald-400 px-3 py-2 text-black"
                          >
                            Freigeben
                          </button>
                          <button
                            onClick={() => act(row.id, 'reject')}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-red-200"
                          >
                            Ablehnen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                        Keine Upgrade-Anfragen vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
