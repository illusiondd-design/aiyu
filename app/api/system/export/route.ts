import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { writeSystemArtifacts } from '@/utils/systemExport'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const result = writeSystemArtifacts(leads || [])

    return NextResponse.json({
      success: true,
      generated_at: result.generated_at,
      files: result.files,
      status: result.status,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
