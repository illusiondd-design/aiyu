import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  buildTelegramReminderMessage,
  getDueReminderLeads,
  sendTelegramMessage,
} from '@/utils/telegramReminder'
import {
  markReminderError,
  markReminderSkipped,
  markReminderSuccess,
  readReminderLog,
  wasAlreadySentToday,
} from '@/utils/telegramReminderLog'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const expected = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET) {
      markReminderError('CRON_SECRET fehlt')
      return NextResponse.json(
        { error: 'CRON_SECRET fehlt' },
        { status: 500 }
      )
    }

    if (authHeader !== expected) {
      markReminderError('Unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(req.url)
    const force = url.searchParams.get('force') === '1'

    if (!force && wasAlreadySentToday()) {
      const log = readReminderLog()
      markReminderSkipped('Bereits heute gesendet')

      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Bereits heute gesendet',
        log,
      })
    }

    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (error) {
      markReminderError(error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const rows = leads || []
    const dueLeads = getDueReminderLeads(rows)
    const message = buildTelegramReminderMessage(rows)

    await sendTelegramMessage(message)
    markReminderSuccess(dueLeads.length)

    return NextResponse.json({
      success: true,
      skipped: false,
      sent_count: dueLeads.length,
      preview: message,
      log: readReminderLog(),
    })
  } catch (error: any) {
    markReminderError(error?.message || 'Unexpected server error')
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
