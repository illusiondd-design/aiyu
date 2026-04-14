import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, review_status } = body

    const allowed = ['approved', 'rejected', 'published', 'scheduled']
    if (!id || !allowed.includes(review_status)) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe' },
        { status: 400 }
      )
    }

    const patch: Record<string, unknown> = {
      review_status,
    }

    if (review_status === 'approved') patch.approved_at = new Date().toISOString()
    if (review_status === 'published') patch.published_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('generated_social_posts')
      .update(patch)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    return NextResponse.json(
      { error: 'Serverfehler', detail: String(err) },
      { status: 500 }
    )
  }
}
