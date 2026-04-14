import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.requested_package) {
      return NextResponse.json(
        { error: 'requested_package fehlt' },
        { status: 400 }
      )
    }

    const payload = {
      company_id: body.company_id || null,
      company_name: body.company_name || null,
      requested_package: body.requested_package,
      name: body.name || null,
      email: body.email || null,
      message: body.message || null,
      status: 'new'
    }

    const { data, error } = await supabase
      .from('upgrade_requests')
      .insert([payload])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      request: data
    })
  } catch (error: any) {
    console.error('POST /api/upgrade-requests error:', error)
    return NextResponse.json(
      { error: 'Upgrade-Anfrage konnte nicht gespeichert werden', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      requests: data || []
    })
  } catch (error: any) {
    console.error('GET /api/upgrade-requests error:', error)
    return NextResponse.json(
      { error: 'Upgrade-Anfragen konnten nicht geladen werden', details: error.message },
      { status: 500 }
    )
  }
}
