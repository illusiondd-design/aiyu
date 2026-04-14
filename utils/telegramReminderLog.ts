import fs from 'fs'
import path from 'path'

type ReminderLog = {
  last_sent_date: string | null
  last_sent_at: string | null
  last_sent_count: number
  last_status: 'success' | 'skipped' | 'error' | null
  last_error: string | null
}

const LOG_DIR = path.join(process.cwd(), 'data', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'telegram-daily-reminder.json')

function ensureLogFile() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }

  if (!fs.existsSync(LOG_FILE)) {
    const initial: ReminderLog = {
      last_sent_date: null,
      last_sent_at: null,
      last_sent_count: 0,
      last_status: null,
      last_error: null,
    }
    fs.writeFileSync(LOG_FILE, JSON.stringify(initial, null, 2), 'utf8')
  }
}

export function getTodayKey() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function readReminderLog(): ReminderLog {
  ensureLogFile()

  try {
    const raw = fs.readFileSync(LOG_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {
      last_sent_date: null,
      last_sent_at: null,
      last_sent_count: 0,
      last_status: null,
      last_error: null,
    }
  }
}

export function writeReminderLog(data: ReminderLog) {
  ensureLogFile()
  fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), 'utf8')
}

export function markReminderSuccess(count: number) {
  const today = getTodayKey()
  writeReminderLog({
    last_sent_date: today,
    last_sent_at: new Date().toISOString(),
    last_sent_count: count,
    last_status: 'success',
    last_error: null,
  })
}

export function markReminderSkipped(reason: string) {
  const current = readReminderLog()
  writeReminderLog({
    ...current,
    last_status: 'skipped',
    last_error: reason,
  })
}

export function markReminderError(message: string) {
  const current = readReminderLog()
  writeReminderLog({
    ...current,
    last_status: 'error',
    last_error: message,
  })
}

export function wasAlreadySentToday() {
  const log = readReminderLog()
  return log.last_sent_date === getTodayKey()
}
