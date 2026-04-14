'use client'

import dynamic from 'next/dynamic'

const LeadsKanban = dynamic(() => import('@/components/LeadsKanban'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        background: '#111',
        color: '#fff',
        border: '1px solid #2a2a2a',
        borderRadius: 14,
        padding: 16,
      }}
    >
      Kanban lädt...
    </div>
  ),
})

export default function LeadsKanbanClient({
  initialLeads,
}: {
  initialLeads: any[]
}) {
  return <LeadsKanban initialLeads={initialLeads} />
}
