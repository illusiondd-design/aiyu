import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { POSTMEISTER_SESSION_COOKIE, createSessionValue } from '@/lib/auth/session'
import { POSTMEISTER_PACKAGE_COOKIE, normalizePackage } from '@/lib/auth/package'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'E-Mail und Passwort sind erforderlich.' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password, package')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { ok: false, error: 'Ungültige Zugangsdaten.' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, String(user.password))

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Ungültige Zugangsdaten.' },
        { status: 401 }
      )
    }

    const pkg = normalizePackage(user.package)
    const sessionValue = createSessionValue(String(user.id))

    if (!sessionValue) {
      return NextResponse.json(
        { ok: false, error: 'Session-Konfiguration fehlt.' },
        { status: 500 }
      )
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        package: pkg,
      },
    })

    res.cookies.set({
      name: POSTMEISTER_SESSION_COOKIE,
      value: sessionValue,
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    res.cookies.set({
      name: POSTMEISTER_PACKAGE_COOKIE,
      value: pkg,
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Serverfehler' },
      { status: 500 }
    )
  }
}
