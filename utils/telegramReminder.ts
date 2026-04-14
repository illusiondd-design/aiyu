type ReminderLead = {
  id: string
  name?: string | null
  requested_package?: string | null
  lead_type?: string | null
  priority?: string | null
  follow_up_at?: string | null
  status?: string | null
  closed?: boolean | null
}

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateDE(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('de-DE')
}

export function getDueReminderLeads(leads: ReminderLead[]) {
  const today = toStartOfDay(new Date())

  return (leads || [])
    .filter((lead) => lead.closed !== true)
    .filter((lead) => !!lead.follow_up_at)
    .map((lead) => {
      const followDate = toStartOfDay(new Date(lead.follow_up_at!))
      return { ...lead, _followDate: followDate }
    })
    .filter((lead) => !Number.isNaN(lead._followDate.getTime()))
    .filter((lead) => lead._followDate <= today)
    .sort((a, b) => a._followDate.getTime() - b._followDate.getTime())
}

export function buildTelegramReminderMessage(leads: ReminderLead[]) {
  const dueLeads = getDueReminderLeads(leads).slice(0, 20)
  const today = toStartOfDay(new Date())

  if (!dueLeads.length) {
    return '📭 Postmeister Reminder\n\nKeine heute fälligen oder überfälligen Leads.'
  }

  const overdueCount = dueLeads.filter((lead) => lead._followDate < today).length
  const todayCount = dueLeads.filter(
    (lead) => lead._followDate.getTime() === today.getTime()
  ).length

  const lines = dueLeads.map((lead, index) => {
    const state =
      lead._followDate < today ? '🔴 überfällig' : '🟠 heute'
    const type = lead.lead_type || '-'
    const priority = lead.priority || '-'
    const pkg = lead.requested_package || '-'
    const name = lead.name || '-'
    const follow = formatDateDE(lead.follow_up_at)
    const status = lead.status || '-'

    return `${index + 1}. ${name}
   Paket: ${pkg}
   Typ/Priorität: ${type} / ${priority}
   Follow-up: ${follow} (${state})
   Status: ${status}`
  })

  return `📌 Postmeister Reminder

Heute fällig: ${todayCount}
Überfällig: ${overdueCount}
Gesamt im Digest: ${dueLeads.length}

${lines.join('\n\n')}`
}

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    throw new Error('Telegram ENV fehlt: TELEGRAM_BOT_TOKEN oder TELEGRAM_CHAT_ID')
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })

  const json = await res.json()

  if (!res.ok || !json.ok) {
    throw new Error(json?.description || 'Telegram send failed')
  }

  return json
}
