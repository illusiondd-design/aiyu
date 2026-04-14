import { NextResponse } from 'next/server'
import { readReminderLog } from '@/utils/telegramReminderLog'

export async function GET() {
  return NextResponse.json({
    success: true,
    log: readReminderLog(),
  })
}
