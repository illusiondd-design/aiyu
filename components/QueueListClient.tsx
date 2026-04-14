'use client'

import dynamic from 'next/dynamic'

const QueueList = dynamic(() => import('@/components/QueueList'), {
  ssr: false,
  loading: () => (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-gray-500">Queue lädt...</div>
    </section>
  ),
})

export default function QueueListClient() {
  return <QueueList />
}
