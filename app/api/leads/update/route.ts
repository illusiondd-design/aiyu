import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const raw = formData.get('payload')

    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
    }

    const { id, updates } = JSON.parse(raw)

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await supabase
      .from('upgrade_requests')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
