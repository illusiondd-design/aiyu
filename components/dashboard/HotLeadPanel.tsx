import { formatDateDE } from '@/utils/followupUtils'

export default function HotLeadPanel({ leads }: { leads: any[] }) {
  const hotLeads = (leads || [])
    .filter((lead) => (lead.lead_type || '').toLowerCase() === 'hot')
    .filter((lead) => lead.closed !== true)
    .slice(0, 8)

  return (
    <div
      style={{
        background: '#151515',
        border: '1px solid #2a2a2a',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Hot Leads</h2>
        <span
          style={{
            minWidth: 28,
            height: 28,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3a1010',
            color: '#fff',
            border: '1px solid #7f1d1d',
            fontSize: 12,
            padding: '0 8px',
            fontWeight: 700,
          }}
        >
          {hotLeads.length}
        </span>
      </div>

      {hotLeads.length === 0 ? (
        <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
          Keine offenen Hot Leads vorhanden.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {hotLeads.map((lead) => (
            <div
              key={lead.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr auto auto',
                gap: 10,
                alignItems: 'center',
                background: '#0f0f0f',
                border: '1px solid #262626',
                borderLeft: '4px solid #ef4444',
                borderRadius: 10,
                padding: 10,
              }}
            >
              <div style={{ fontWeight: 700 }}>{lead.name || '-'}</div>
              <div style={{ color: '#d4d4d4', fontSize: 13 }}>
                {lead.requested_package || '-'}
              </div>
              <div style={{ color: '#d4d4d4', fontSize: 13 }}>
                {formatDateDE(lead.follow_up_at)}
              </div>
              <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700 }}>
                {lead.hot_alert_sent ? 'ALERT OK' : 'NEU'}
              </div>
              <div style={{ fontSize: 12, color: '#fff' }}>
                {lead.status || '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
