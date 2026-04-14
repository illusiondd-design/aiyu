export type LeadItem = {
  id: string | number
  name?: string | null
  requested_package?: string | null
  follow_up_at?: string | null
  lead_type?: string | null
  priority?: string | null
  closed?: boolean | null
  contacted?: boolean | null
}

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function categorizeFollowUps(leads: LeadItem[]) {
  const today = toStartOfDay(new Date())
  const in3Days = new Date(today)
  in3Days.setDate(in3Days.getDate() + 3)

  const result = {
    today: [] as LeadItem[],
    overdue: [] as LeadItem[],
    upcoming: [] as LeadItem[],
  }

  for (const lead of leads || []) {
    if (!lead?.follow_up_at) continue
    if (lead?.closed === true) continue

    const followDate = toStartOfDay(new Date(lead.follow_up_at))
    if (Number.isNaN(followDate.getTime())) continue

    if (followDate.getTime() === today.getTime()) {
      result.today.push(lead)
    } else if (followDate < today) {
      result.overdue.push(lead)
    } else if (followDate > today && followDate <= in3Days) {
      result.upcoming.push(lead)
    }
  }

  return result
}

export function getPriorityBadgeClass(priority?: string | null) {
  const value = (priority || "").toLowerCase()

  if (value === "high") {
    return "bg-red-100 text-red-700 border border-red-200"
  }

  if (value === "medium" || value === "normal") {
    return "bg-yellow-100 text-yellow-800 border border-yellow-200"
  }

  if (value === "low") {
    return "bg-gray-100 text-gray-700 border border-gray-200"
  }

  return "bg-slate-100 text-slate-700 border border-slate-200"
}

export function formatDateDE(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("de-DE")
}
