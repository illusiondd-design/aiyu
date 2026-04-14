import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabase Client
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

// Demo Context
const DEMO_ACCOUNT_SLUG = 'rob-demo'
const DEMO_COMPANY_ID = 'rob-kfz'

async function getDemoContext() {
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', DEMO_ACCOUNT_SLUG)
    .single()

  if (accountError || !account) {
    throw new Error(`Demo account not found: ${accountError?.message || 'unknown error'}`)
  }

  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('id')
    .eq('account_id', account.id)
    .eq('company_id', DEMO_COMPANY_ID)
    .maybeSingle()

  if (brandError) {
    throw new Error(`Demo brand lookup failed: ${brandError.message}`)
  }

  if (!brand) {
    throw new Error(`Demo brand not found for account ${account.id} and company_id ${DEMO_COMPANY_ID}`)
  }

  return {
    brand_id: brand.id
  }
}

// GET: Load Assets
export async function GET() {
  try {
    const context = await getDemoContext()

    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('brand_id', context.brand_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      assets: data || []
    })
  } catch (error: any) {
    console.error('GET /api/brand-assets error:', error)
    return NextResponse.json(
      { error: 'Failed to load assets', details: error.message },
      { status: 500 }
    )
  }
}

// POST: Save Asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const context = await getDemoContext()

    const payload = {
      brand_id: context.brand_id,
      asset_type: body.asset_type,
      file_url: body.file_url,
      is_primary: body.is_primary || false
    }

    const { data, error } = await supabase
      .from('brand_assets')
      .insert([payload])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      asset: data
    })
  } catch (error: any) {
    console.error('POST /api/brand-assets error:', error)
    return NextResponse.json(
      { error: 'Failed to save asset', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH: Set asset as primary
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const context = await getDemoContext()
    const assetId = body.id as string | undefined

    if (!assetId) {
      return NextResponse.json({ error: 'Missing asset ID' }, { status: 400 })
    }

    const { data: asset, error: assetError } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('id', assetId)
      .eq('brand_id', context.brand_id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    if (asset.asset_type === 'logo') {
      const { error: resetError } = await supabase
        .from('brand_assets')
        .update({ is_primary: false })
        .eq('brand_id', context.brand_id)
        .eq('asset_type', 'logo')

      if (resetError) throw resetError
    }

    const { data, error } = await supabase
      .from('brand_assets')
      .update({ is_primary: true })
      .eq('id', assetId)
      .eq('brand_id', context.brand_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      asset: data
    })
  } catch (error: any) {
    console.error('PATCH /api/brand-assets error:', error)
    return NextResponse.json(
      { error: 'Failed to update asset', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Remove asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const context = await getDemoContext()

    if (!id) {
      return NextResponse.json({ error: 'Missing asset ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', id)
      .eq('brand_id', context.brand_id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Asset deleted'
    })
  } catch (error: any) {
    console.error('DELETE /api/brand-assets error:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset', details: error.message },
      { status: 500 }
    )
  }
}
