export function getLeadPriorityBarClass(priority?: string | null) {
  const value = (priority || "").toLowerCase()

  if (value === "high") return "border-l-4 border-red-500"
  if (value === "medium" || value === "normal") return "border-l-4 border-yellow-500"
  if (value === "low") return "border-l-4 border-gray-400"

  return "border-l-4 border-slate-300"
}

export function isLeadOverdue(followUpAt?: string | null, closed?: boolean | null) {
  if (!followUpAt) return false
  if (closed === true) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const date = new Date(followUpAt)
  date.setHours(0, 0, 0, 0)

  if (Number.isNaN(date.getTime())) return false
  return date < today
}

export function isLeadDueToday(followUpAt?: string | null, closed?: boolean | null) {
  if (!followUpAt) return false
  if (closed === true) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const date = new Date(followUpAt)
  date.setHours(0, 0, 0, 0)

  if (Number.isNaN(date.getTime())) return false
  return date.getTime() === today.getTime()
}

export function formatLeadDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("de-DE")
}
