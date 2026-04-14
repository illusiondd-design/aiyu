import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, follow_up_at, closed } = body || {}

    if (!id) {
      return NextResponse.json(
        { error: 'Missing lead id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: Record<string, any> = {}

    if (follow_up_at !== undefined) {
      updateData.follow_up_at = follow_up_at
    }

    if (closed !== undefined) {
      updateData.closed = closed
      if (closed === true) {
        updateData.status = 'closed'
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No update fields provided' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('upgrade_requests')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      lead: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
