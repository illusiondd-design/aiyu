import { formatDateDE } from '@/utils/followupUtils'

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function ReminderCenterPanel({ leads }: { leads: any[] }) {
  const today = toStartOfDay(new Date())

  const dueLeads = (leads || [])
    .filter((lead) => lead.closed !== true)
    .filter((lead) => !!lead.follow_up_at)
    .map((lead) => {
      const date = toStartOfDay(new Date(lead.follow_up_at))
      return { ...lead, _followDate: date }
    })
    .filter((lead) => !Number.isNaN(lead._followDate.getTime()))
    .filter((lead) => lead._followDate <= today)
    .sort((a, b) => a._followDate.getTime() - b._followDate.getTime())
    .slice(0, 12)

  const overdueCount = dueLeads.filter((lead) => lead._followDate < today).length
  const todayCount = dueLeads.filter((lead) => lead._followDate.getTime() === today.getTime()).length
  const unmarkedCount = dueLeads.filter((lead) => lead.hot_alert_sent !== true).length

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
        <h2 style={{ margin: 0, fontSize: 18 }}>Reminder Center</h2>
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
            fontWeight: 700,
          }}
        >
          {dueLeads.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={chipNeutral}>Heute: {todayCount}</span>
        <span style={chipRed}>Überfällig: {overdueCount}</span>
        <span style={chipOrange}>Offene Reminder: {unmarkedCount}</span>
      </div>

      {dueLeads.length === 0 ? (
        <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
          Keine heute fälligen oder überfälligen Reminder.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {dueLeads.map((lead) => {
            const isOverdue = lead._followDate < today
            const isMarked = lead.hot_alert_sent === true

            return (
              <div
                key={lead.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr auto auto',
                  gap: 10,
                  alignItems: 'center',
                  background: '#0f0f0f',
                  border: '1px solid #262626',
                  borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid #f97316',
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
                  <span style={isOverdue ? chipRed : chipNeutral}>
                    {isOverdue ? 'Überfällig' : 'Heute'}
                  </span>
                </div>
                <div>
                  <span style={isMarked ? chipGreen : chipOrange}>
                    {isMarked ? 'Markiert' : 'Offen'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const chipBase: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  fontWeight: 700,
  border: '1px solid transparent',
}

const chipNeutral: React.CSSProperties = {
  ...chipBase,
  background: '#202020',
  color: '#ddd',
  border: '1px solid #333',
}

const chipRed: React.CSSProperties = {
  ...chipBase,
  background: 'rgba(239,68,68,0.14)',
  color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.28)',
}

const chipOrange: React.CSSProperties = {
  ...chipBase,
  background: 'rgba(249,115,22,0.14)',
  color: '#fdba74',
  border: '1px solid rgba(249,115,22,0.28)',
}

const chipGreen: React.CSSProperties = {
  ...chipBase,
  background: 'rgba(16,185,129,0.14)',
  color: '#a7f3d0',
  border: '1px solid rgba(16,185,129,0.28)',
}
