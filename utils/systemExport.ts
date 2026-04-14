import fs from 'fs'
import path from 'path'

type Lead = {
  id: string
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

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function nowParts() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return {
    date: `${yyyy}-${mm}-${dd}`,
    timestamp: `${yyyy}-${mm}-${dd}__${hh}-${mi}-${ss}`,
    iso: now.toISOString(),
  }
}

function countBy<T extends string>(items: Lead[], getKey: (lead: Lead) => T | string | null | undefined) {
  const result: Record<string, number> = {}
  for (const item of items) {
    const key = String(getKey(item) || 'unknown')
    result[key] = (result[key] || 0) + 1
  }
  return result
}

export function buildSystemStatus(leads: Lead[]) {
  const all = leads || []
  const openStatuses = ['new', 'processing', 'notified', 'missing_email']

  return {
    generated_at: new Date().toISOString(),
    total_leads: all.length,
    open_leads: all.filter((l) => openStatuses.includes(l.status || '')).length,
    closed_leads: all.filter((l) => l.closed === true || l.status === 'closed').length,
    hot_leads: all.filter((l) => (l.lead_type || '').toLowerCase() === 'hot').length,
    warm_leads: all.filter((l) => (l.lead_type || '').toLowerCase() === 'warm').length,
    cold_leads: all.filter((l) => (l.lead_type || '').toLowerCase() === 'cold').length,
    overdue_followups: all.filter((l) => isOverdue(l.follow_up_at, l.closed)).length,
    today_followups: all.filter((l) => isToday(l.follow_up_at, l.closed)).length,
    reminder_marked: all.filter((l) => l.hot_alert_sent === true).length,
    by_status: countBy(all, (l) => l.status),
    by_priority: countBy(all, (l) => l.priority),
    by_package: countBy(all, (l) => l.requested_package),
  }
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

function formatDateTimeDE(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('de-DE')
}

export function buildSnapshotMarkdown(leads: Lead[]) {
  const parts = nowParts()
  const status = buildSystemStatus(leads)

  const topHot = [...(leads || [])]
    .filter((l) => (l.lead_type || '').toLowerCase() === 'hot' && l.closed !== true)
    .slice(0, 10)

  const due = [...(leads || [])]
    .filter((l) => isOverdue(l.follow_up_at, l.closed) || isToday(l.follow_up_at, l.closed))
    .slice(0, 10)

  return `# POSTMEISTER SNAPSHOT

## Metadaten
- Datum: ${parts.date}
- Erstellt: ${parts.iso}

## KPI
- Gesamtleads: ${status.total_leads}
- Offen: ${status.open_leads}
- Geschlossen: ${status.closed_leads}
- Hot Leads: ${status.hot_leads}
- Überfällige Follow-ups: ${status.overdue_followups}
- Heute fällige Follow-ups: ${status.today_followups}
- Reminder markiert: ${status.reminder_marked}

## Statusverteilung
${Object.entries(status.by_status).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- keine Daten'}

## Prioritätsverteilung
${Object.entries(status.by_priority).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- keine Daten'}

## Wichtigste Hot Leads
${topHot.length ? topHot.map((lead, i) => `- ${i + 1}. ${lead.name || '-'} | Paket: ${lead.requested_package || '-'} | Score: ${lead.lead_score ?? '-'} | Status: ${lead.status || '-'} | Follow-up: ${formatDateTimeDE(lead.follow_up_at)}`).join('\n') : '- keine offenen Hot Leads'}

## Fällige Leads
${due.length ? due.map((lead, i) => `- ${i + 1}. ${lead.name || '-'} | Paket: ${lead.requested_package || '-'} | Typ: ${lead.lead_type || '-'} | Priorität: ${lead.priority || '-'} | Follow-up: ${formatDateTimeDE(lead.follow_up_at)}`).join('\n') : '- keine fälligen Leads'}

## Nächste operative Schritte
- Reminder Center prüfen
- Hot Leads priorisiert abarbeiten
- Telegram-Digest kontrollieren
- Follow-ups aktualisieren
`
}

export function buildHandoverMarkdown(leads: Lead[]) {
  const status = buildSystemStatus(leads)

  return `# POSTMEISTER HANDOVER

## Systemstand
- Dashboard aktiv
- Kanban aktiv
- Follow-up-Panel aktiv
- Reminder Center aktiv
- Hot-Lead-Panel aktiv
- Telegram Reminder aktiv
- Daily Telegram Cron aktiv
- Automation Status Panel aktiv

## KPI
- Gesamtleads: ${status.total_leads}
- Offen: ${status.open_leads}
- Geschlossen: ${status.closed_leads}
- Hot Leads: ${status.hot_leads}
- Überfällig: ${status.overdue_followups}
- Heute fällig: ${status.today_followups}

## Aktive Kernfunktionen
- Auto-Scoring für Leads
- Live-Auto-Scoring bei neuen Leads
- Bulk-Actions im Kanban
- Reminder-Markierung
- Telegram Reminder manuell
- Telegram Daily Cron mit Dedup-Log
- Export-/Snapshot-Modus

## Relevante Ordner
- data/exports
- data/snapshots
- data/handover
- data/logs

## Relevante APIs
- /api/upgrade-requests
- /api/leads/auto-score
- /api/leads/followup
- /api/leads/bulk-update
- /api/leads/hot-alert
- /api/leads/reminder
- /api/leads/telegram-reminder
- /api/cron/daily-telegram-reminder
- /api/cron/daily-telegram-reminder-log
- /api/system/export

## Nächste sinnvolle Ausbaustufen
- CSV/XLSX Export
- echte Rollen-/Adminrechte
- Daily Snapshot per Telegram/E-Mail
- Kundenspezifische Views
`
}

export function writeSystemArtifacts(leads: Lead[]) {
  const exportsDir = path.join(process.cwd(), 'data', 'exports')
  const snapshotsDir = path.join(process.cwd(), 'data', 'snapshots')
  const handoverDir = path.join(process.cwd(), 'data', 'handover')

  ensureDir(exportsDir)
  ensureDir(snapshotsDir)
  ensureDir(handoverDir)

  const parts = nowParts()
  const status = buildSystemStatus(leads)
  const snapshot = buildSnapshotMarkdown(leads)
  const handover = buildHandoverMarkdown(leads)

  const statusFile = path.join(exportsDir, `postmeister_status__${parts.timestamp}.json`)
  const snapshotFile = path.join(snapshotsDir, `postmeister_snapshot__${parts.timestamp}.md`)
  const handoverFile = path.join(handoverDir, `postmeister_handover__${parts.timestamp}.md`)

  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2), 'utf8')
  fs.writeFileSync(snapshotFile, snapshot, 'utf8')
  fs.writeFileSync(handoverFile, handover, 'utf8')

  fs.writeFileSync(path.join(exportsDir, 'postmeister_status__latest.json'), JSON.stringify(status, null, 2), 'utf8')
  fs.writeFileSync(path.join(snapshotsDir, 'postmeister_snapshot__latest.md'), snapshot, 'utf8')
  fs.writeFileSync(path.join(handoverDir, 'postmeister_handover__latest.md'), handover, 'utf8')

  return {
    generated_at: parts.iso,
    files: {
      statusFile,
      snapshotFile,
      handoverFile,
      latestStatus: path.join(exportsDir, 'postmeister_status__latest.json'),
      latestSnapshot: path.join(snapshotsDir, 'postmeister_snapshot__latest.md'),
      latestHandover: path.join(handoverDir, 'postmeister_handover__latest.md'),
    },
    status,
  }
}
