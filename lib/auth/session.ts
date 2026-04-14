import { NextRequest } from 'next/server'

export const POSTMEISTER_SESSION_COOKIE = 'postmeister_session'

export function getSessionSecret() {
  return process.env.POSTMEISTER_SESSION_SECRET || ''
}

export function createSessionValue(userId: string) {
  const secret = getSessionSecret()
  if (!secret) return ''
  return `${userId}.${secret}`
}

export function getSessionUserId(req: NextRequest) {
  const secret = getSessionSecret()
  const raw = req.cookies.get(POSTMEISTER_SESSION_COOKIE)?.value || ''

  if (!secret || !raw.includes('.')) return null

  const [userId, token] = raw.split('.', 2)
  if (!userId || !token) return null
  if (token !== secret) return null

  return userId
}

export function hasValidSession(req: NextRequest) {
  return !!getSessionUserId(req)
}
