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
    const pkg = String(body?.package || '').trim().toLowerCase()

    if (!['go', 'pro', 'ultra'].includes(pkg)) {
      return NextResponse.json({ ok: false, error: 'Ungültiges Paket.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ package: pkg })
      .eq('id', id)
      .select('id, email, package, created_at')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user: data })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isUltraAdmin(req))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const sessionUserId = getSessionUserId(req)

    if (sessionUserId === id) {
      return NextResponse.json(
        { ok: false, error: 'Eigenen Admin-User nicht löschen.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}
