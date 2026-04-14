type AutomationLog = {
  last_sent_date: string | null
  last_sent_at: string | null
  last_sent_count: number
  last_status: 'success' | 'skipped' | 'error' | null
  last_error: string | null
}

function formatDateTimeDE(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('de-DE')
}

function statusStyle(status?: string | null): React.CSSProperties {
  if (status === 'success') {
    return {
      background: 'rgba(16,185,129,0.14)',
      color: '#a7f3d0',
      border: '1px solid rgba(16,185,129,0.28)',
    }
  }

  if (status === 'skipped') {
    return {
      background: 'rgba(249,115,22,0.14)',
      color: '#fdba74',
      border: '1px solid rgba(249,115,22,0.28)',
    }
  }

  if (status === 'error') {
    return {
      background: 'rgba(239,68,68,0.14)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.28)',
    }
  }

  return {
    background: '#202020',
    color: '#ddd',
    border: '1px solid #333',
  }
}

export default function AutomationStatusPanel({
  log,
}: {
  log: AutomationLog
}) {
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
        <h2 style={{ margin: 0, fontSize: 18 }}>Automation Status</h2>
        <span
          style={{
            ...statusStyle(log?.last_status),
            fontSize: 12,
            padding: '4px 8px',
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          {log?.last_status || 'unknown'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}
      >
        <div style={card}>
          <div style={label}>Letzter Versandtag</div>
          <div style={value}>{log?.last_sent_date || '-'}</div>
        </div>

        <div style={card}>
          <div style={label}>Letzter Versandzeitpunkt</div>
          <div style={value}>{formatDateTimeDE(log?.last_sent_at)}</div>
        </div>

        <div style={card}>
          <div style={label}>Gesendete Leads</div>
          <div style={value}>{log?.last_sent_count ?? 0}</div>
        </div>

        <div style={card}>
          <div style={label}>Letzter Fehler / Hinweis</div>
          <div style={valueSmall}>{log?.last_error || '-'}</div>
        </div>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#0f0f0f',
  border: '1px solid #262626',
  borderRadius: 10,
  padding: 12,
}

const label: React.CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  marginBottom: 6,
}

const value: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
}

const valueSmall: React.CSSProperties = {
  fontSize: 13,
  color: '#e5e7eb',
  whiteSpace: 'pre-wrap',
}
