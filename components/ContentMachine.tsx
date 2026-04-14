'use client'

import { useCallback, useEffect, useState } from 'react'
import ResultBoard, { ShortItem } from '@/components/ResultBoard'

type PackageType = 'starter' | 'pro' | 'business' | string

type ContentMachineProps = {
  userPackage?: PackageType
}

type UploadListResponse = {
  success: boolean
  items?: ShortItem[]
  error?: string
}

export default function ContentMachine({ userPackage }: ContentMachineProps) {
  const [items, setItems] = useState<ShortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUploads = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      if (silent) setRefreshing(true)
      setError(null)

      const response = await fetch('/api/uploads/list', {
        cache: 'no-store',
      })

      const json: UploadListResponse = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Upload-Liste konnte nicht geladen werden.')
      }

      setItems(Array.isArray(json.items) ? json.items : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadUploads(false)
  }, [loadUploads, userPackage])

  useEffect(() => {
    const onFocus = () => loadUploads(true)
    const onUploadsRefresh = () => loadUploads(true)
    const interval = window.setInterval(() => loadUploads(true), 10000)

    window.addEventListener('focus', onFocus)
    window.addEventListener('uploads:refresh', onUploadsRefresh)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('uploads:refresh', onUploadsRefresh)
      window.clearInterval(interval)
    }
  }, [loadUploads])

  void userPackage

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {refreshing ? 'Aktualisiere Uploads…' : 'Uploads werden automatisch aktualisiert.'}
        </div>

        <button
          onClick={() => loadUploads(true)}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300"
        >
          Aktualisieren
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          Uploads werden geladen...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">
          {error}
        </div>
      ) : (
        <ResultBoard items={items} />
      )}
    </div>
  )
}
