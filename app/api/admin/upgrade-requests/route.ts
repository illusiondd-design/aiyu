import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hasValidSession, getSessionUserId } from '@/lib/auth/session'

async function isUltraAdmin(req: NextRequest) {
  if (!hasValidSession(req)) return false

  const userId = getSessionUserId(req)
  if (!userId) return false

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('package')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return String(data.package || '').toLowerCase() === 'ultra'
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isUltraAdmin(req))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, requests: data || [] })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}
