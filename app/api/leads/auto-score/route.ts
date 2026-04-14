import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { scoreLead } from '@/utils/leadScoring'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = leads || []
    const results = []

    for (const lead of rows) {
      const scored = scoreLead(lead)

      const { data, error: updateError } = await supabase
        .from('upgrade_requests')
        .update({
          lead_score: scored.lead_score,
          lead_type: scored.lead_type,
          priority: scored.priority,
          follow_up_at: lead.follow_up_at || scored.follow_up_at,
        })
        .eq('id', lead.id)
        .select('*')
        .single()

      if (!updateError && data) {
        results.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      leads: results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
