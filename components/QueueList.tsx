'use client'

import { useEffect, useState } from "react";

type QueueItem = {
  id: number;
  platform?: string;
  status?: string;
  created_at?: string;
};

export default function QueueList() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔧 Hydration Fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Daten laden
  async function loadItems() {
    try {
      setLoading(true);

      const res = await fetch('/api/review/batches?status=pending&limit=200');
      const json = await res.json();

      if (json?.ok && json?.data) {
        setItems(json.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Queue Load Error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      loadItems();
    }
  }, [mounted]);

  // ❗ verhindert SSR / Hydration Fehler komplett
  if (!mounted) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Content Queue
        </h2>

        <button
          type="button"
          onClick={loadItems}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
        >
          {loading ? 'Lädt...' : 'Neu laden'}
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-sm text-gray-500">
          Keine offenen Einträge vorhanden
        </div>
      )}

      <div className="space-y-3">
      {items.map((item, index) => (
        <div
         key={`${item.id || 'no-id'}-${index}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">
                Post #{item.id}
              </div>
              <div className="text-xs text-gray-500">
                {item.platform || '—'} • {item.status || 'pending'}
              </div>
            </div>

            <div className="text-xs text-gray-400">
              {item.created_at
                ? new Date(item.created_at).toLocaleString('de-DE')
                : '-'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
