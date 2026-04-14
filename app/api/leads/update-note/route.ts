import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const id = formData.get('id')
    const internal_note = formData.get('internal_note')

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('upgrade_requests')
      .update({ internal_note })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
