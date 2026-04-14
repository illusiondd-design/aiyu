type Lead = {
  id?: string
  name?: string | null
  email?: string | null
  requested_package?: string | null
  lead_score?: number | null
  lead_type?: string | null
  status?: string | null
  hot_alert_sent?: boolean | null
  follow_up_at?: string | null
  internal_note?: string | null
  message?: string | null
  priority?: string | null
  closed?: boolean | null
  created_at?: string | null
}

function escapeCsv(value: unknown) {
  const str = String(value ?? '')
  if (str.includes('"') || str.includes(';') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString()
}

export function leadsToCsv(leads: Lead[]) {
  const headers = [
    'id',
    'name',
    'email',
    'requested_package',
    'lead_score',
    'lead_type',
    'priority',
    'status',
    'hot_alert_sent',
    'follow_up_at',
    'closed',
    'created_at',
    'internal_note',
    'message',
  ]

  const rows = (leads || []).map((lead) => [
    lead.id,
    lead.name,
    lead.email,
    lead.requested_package,
    lead.lead_score,
    lead.lead_type,
    lead.priority,
    lead.status,
    lead.hot_alert_sent,
    formatDate(lead.follow_up_at),
    lead.closed,
    formatDate(lead.created_at),
    lead.internal_note,
    lead.message,
  ])

  return [
    headers.map(escapeCsv).join(';'),
    ...rows.map((row) => row.map(escapeCsv).join(';')),
  ].join('\n')
}
