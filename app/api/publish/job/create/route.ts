import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { post_id, platform, provider = null, payload = null } = body

    if (!post_id || !platform) {
      return NextResponse.json(
        { ok: false, error: 'post_id und platform sind erforderlich' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('publish_jobs')
      .insert({
        post_id,
        platform,
        provider,
        payload,
        status: 'queued',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
