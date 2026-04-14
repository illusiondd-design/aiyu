import * as XLSX from 'xlsx'

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

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isOverdue(value?: string | null, closed?: boolean | null) {
  if (!value || closed === true) return false
  const today = toStartOfDay(new Date())
  const date = toStartOfDay(new Date(value))
  if (Number.isNaN(date.getTime())) return false
  return date < today
}

function isToday(value?: string | null, closed?: boolean | null) {
  if (!value || closed === true) return false
  const today = toStartOfDay(new Date())
  const date = toStartOfDay(new Date(value))
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() === today.getTime()
}

function normalizeLead(lead: Lead) {
  return {
    id: lead.id || '',
    name: lead.name || '',
    email: lead.email || '',
    requested_package: lead.requested_package || '',
    lead_score: lead.lead_score ?? '',
    lead_type: lead.lead_type || '',
    priority: lead.priority || '',
    status: lead.status || '',
    hot_alert_sent: lead.hot_alert_sent ?? '',
    follow_up_at: lead.follow_up_at || '',
    closed: lead.closed ?? '',
    created_at: lead.created_at || '',
    internal_note: lead.internal_note || '',
    message: lead.message || '',
  }
}

function countBy(items: Lead[], key: keyof Lead) {
  const result: Record<string, number> = {}
  for (const item of items) {
    const value = String(item[key] || 'unknown')
    result[value] = (result[value] || 0) + 1
  }
  return result
}

export function buildLeadWorkbook(leads: Lead[]) {
  const all = (leads || []).map(normalizeLead)
  const open = (leads || [])
    .filter((l) => ['new', 'processing', 'notified', 'missing_email'].includes(l.status || ''))
    .map(normalizeLead)

  const due = (leads || [])
    .filter((l) => isOverdue(l.follow_up_at, l.closed) || isToday(l.follow_up_at, l.closed))
    .map(normalizeLead)

  const hot = (leads || [])
    .filter((l) => (l.lead_type || '').toLowerCase() === 'hot')
    .map(normalizeLead)

  const summary = [
    { metric: 'generated_at', value: new Date().toISOString() },
    { metric: 'total_leads', value: leads.length },
    { metric: 'open_leads', value: open.length },
    { metric: 'due_leads', value: due.length },
    { metric: 'hot_leads', value: hot.length },
  ]

  const statusCounts = countBy(leads, 'status')
  const priorityCounts = countBy(leads, 'priority')
  const typeCounts = countBy(leads, 'lead_type')

  Object.entries(statusCounts).forEach(([k, v]) => {
    summary.push({ metric: `status_${k}`, value: v })
  })
  Object.entries(priorityCounts).forEach(([k, v]) => {
    summary.push({ metric: `priority_${k}`, value: v })
  })
  Object.entries(typeCounts).forEach(([k, v]) => {
    summary.push({ metric: `type_${k}`, value: v })
  })

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(all), 'All Leads')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(open), 'Open Leads')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(due), 'Due Leads')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hot), 'Hot Leads')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Summary')

  return wb
}
