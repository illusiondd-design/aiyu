import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = Number(searchParams.get('limit') || '50')
    const postId = searchParams.get('post_id')

    let query = supabase
      .from('pipeline_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (postId) {
      query = query.eq('post_id', Number(postId))
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
