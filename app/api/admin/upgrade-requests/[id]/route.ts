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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isUltraAdmin(req))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()
    const action = String(body?.action || '').trim().toLowerCase()

    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from('upgrade_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (requestError || !requestRow) {
      return NextResponse.json({ ok: false, error: 'Anfrage nicht gefunden.' }, { status: 404 })
    }

    if (action === 'approve') {
      const pkg = String(requestRow.requested_package || '').trim().toLowerCase()
      if (!['go', 'pro', 'ultra'].includes(pkg)) {
        return NextResponse.json({ ok: false, error: 'Ungültiges Zielpaket.' }, { status: 400 })
      }

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, package')
        .eq('email', String(requestRow.email || '').trim().toLowerCase())
        .single()

      if (userError || !user) {
        return NextResponse.json({ ok: false, error: 'Passender User nicht gefunden.' }, { status: 404 })
      }

      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({ package: pkg })
        .eq('id', user.id)

      if (updateUserError) {
        return NextResponse.json({ ok: false, error: updateUserError.message }, { status: 500 })
      }

      const { error: requestUpdateError } = await supabaseAdmin
        .from('upgrade_requests')
        .update({ status: 'approved' })
        .eq('id', id)

      if (requestUpdateError) {
        return NextResponse.json({ ok: false, error: requestUpdateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, status: 'approved', email: user.email, package: pkg })
    }

    if (action === 'reject') {
      const { error } = await supabaseAdmin
        .from('upgrade_requests')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, status: 'rejected' })
    }

    return NextResponse.json({ ok: false, error: 'Ungültige Aktion.' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}
