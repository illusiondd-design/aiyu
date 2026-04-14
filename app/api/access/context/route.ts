import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, brand_id, industry, short_description, package, role, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({
        ok: true,
        data: {
          role: 'customer',
          package: 'starter',
          source: 'default_no_brand',
        },
      })
    }

    return NextResponse.json({
      ok: true,
      data: {
        brand_id: data.brand_id ?? data.id ?? null,
        industry: data.industry ?? null,
        short_description: data.short_description ?? null,
        role: data.role || 'customer',
        package: data.package || 'starter',
        source: 'brands_latest',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Access Context Fehler' },
      { status: 500 }
    )
  }
}
