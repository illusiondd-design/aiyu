import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  buildTelegramReminderMessage,
  getDueReminderLeads,
  sendTelegramMessage,
} from '@/utils/telegramReminder'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const rows = leads || []
    const dueLeads = getDueReminderLeads(rows)
    const message = buildTelegramReminderMessage(rows)

    await sendTelegramMessage(message)

    return NextResponse.json({
      success: true,
      sent_count: dueLeads.length,
      preview: message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
