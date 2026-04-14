import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
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
      .from('users')
      .select('id, email, package, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, users: data || [] })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isUltraAdmin(req))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const pkg = String(body?.package || 'pro').trim().toLowerCase()

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      )
    }

    if (!['go', 'pro', 'ultra'].includes(pkg)) {
      return NextResponse.json(
        { ok: false, error: 'Ungültiges Paket.' },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(password, 10)

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hash,
        package: pkg,
      })
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
