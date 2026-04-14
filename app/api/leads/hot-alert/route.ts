import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ids, targetStatus } = body || {}

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing lead ids' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updatePayload: Record<string, any> = {
      hot_alert_sent: true,
    }

    if (targetStatus) {
      updatePayload.status = targetStatus
    }

    const { data, error } = await supabase
      .from('upgrade_requests')
      .update(updatePayload)
      .in('id', ids)
      .select('*')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      leads: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
