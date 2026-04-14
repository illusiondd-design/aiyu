import { NextResponse } from 'next/server'
import { POSTMEISTER_SESSION_COOKIE } from '@/lib/auth/session'
import { POSTMEISTER_PACKAGE_COOKIE } from '@/lib/auth/package'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // Session löschen
  res.cookies.set({
    name: POSTMEISTER_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  })

  // Package löschen
  res.cookies.set({
    name: POSTMEISTER_PACKAGE_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  })

  return res
}
