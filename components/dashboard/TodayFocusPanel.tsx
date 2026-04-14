import { getTodayFocus } from "@/utils/todayFocus"
import { formatDateDE } from "@/utils/followupUtils"

function badgeStyle(priority?: string | null) {
  const value = (priority || '').toLowerCase()

  if (value === 'high') {
    return {
      background: 'rgba(239,68,68,0.14)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.28)',
    }
  }

  if (value === 'medium' || value === 'normal') {
    return {
      background: 'rgba(234,179,8,0.12)',
      color: '#fde68a',
      border: '1px solid rgba(234,179,8,0.22)',
    }
  }

  if (value === 'low') {
    return {
      background: 'rgba(148,163,184,0.12)',
      color: '#cbd5e1',
      border: '1px solid rgba(148,163,184,0.22)',
    }
  }

  return {
    background: '#202020',
    color: '#bbb',
    border: '1px solid #333',
  }
}

export default function TodayFocusPanel({ leads }: { leads: any[] }) {
  const focus = getTodayFocus(leads || []).slice(0, 8)

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Heute zuerst bearbeiten</h2>
        <span
          style={{
            minWidth: 28,
            height: 28,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#222',
            color: '#fff',
            border: '1px solid #333',
            fontSize: 12,
            padding: '0 8px',
          }}
        >
          {focus.length}
        </span>
      </div>

      {focus.length === 0 ? (
        <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
          Keine überfälligen oder heute fälligen Leads.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {focus.map((lead) => (
            <div
              key={lead.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr auto auto',
                gap: 10,
                alignItems: 'center',
                background: '#0f0f0f',
                border: '1px solid #262626',
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
              <div>
                <span
                  style={{
                    ...badgeStyle(lead.priority),
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {lead.priority || 'none'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700 }}>
                {(lead.lead_type || '').toLowerCase() === 'hot' ? 'HOT' : lead.lead_type || '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
