import { NextRequest, NextResponse } from 'next/server'
import { hasValidSession } from '@/lib/auth/session'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  if (!hasValidSession(req as NextRequest)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      },
      { status: 401 }
    )
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const limit = Number(searchParams.get('limit') || '50')
    const postId = searchParams.get('post_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('publish_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (postId) {
      query = query.eq('post_id', Number(postId))
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}

