export type FocusLead = {
  id: string
  name?: string | null
  requested_package?: string | null
  lead_type?: string | null
  priority?: string | null
  follow_up_at?: string | null
  closed?: boolean | null
}

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function priorityWeight(priority?: string | null) {
  const value = (priority || '').toLowerCase()
  if (value === 'high') return 3
  if (value === 'medium' || value === 'normal') return 2
  if (value === 'low') return 1
  return 0
}

function leadTypeWeight(type?: string | null) {
  const value = (type || '').toLowerCase()
  if (value === 'hot') return 3
  if (value === 'warm') return 2
  if (value === 'cold') return 1
  return 0
}

export function getTodayFocus(leads: FocusLead[]) {
  const today = toStartOfDay(new Date())

  const urgent = (leads || []).filter((lead) => {
    if (!lead?.follow_up_at) return false
    if (lead?.closed === true) return false

    const date = toStartOfDay(new Date(lead.follow_up_at))
    if (Number.isNaN(date.getTime())) return false

    return date <= today
  })

  return urgent.sort((a, b) => {
    const aDate = new Date(a.follow_up_at || 0).getTime()
    const bDate = new Date(b.follow_up_at || 0).getTime()

    const dateScore = aDate - bDate
    if (dateScore !== 0) return dateScore

    const priorityScore = priorityWeight(b.priority) - priorityWeight(a.priority)
    if (priorityScore !== 0) return priorityScore

    const typeScore = leadTypeWeight(b.lead_type) - leadTypeWeight(a.lead_type)
    if (typeScore !== 0) return typeScore

    return String(a.name || '').localeCompare(String(b.name || ''))
  })
}
