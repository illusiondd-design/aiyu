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

const DEMO_ACCOUNT_SLUG = 'rob-demo'
const DEMO_COMPANY_ID = 'rob-kfz'
const BUCKET = 'brand-assets'

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
    account_id: account.id,
    brand_id: brand.id
  }
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const assetType = String(formData.get('asset_type') || '')
    const isPrimary = String(formData.get('is_primary') || 'false') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Datei fehlt' }, { status: 400 })
    }

    if (!['logo', 'image', 'video'].includes(assetType)) {
      return NextResponse.json({ error: 'Ungültiger asset_type' }, { status: 400 })
    }

    const context = await getDemoContext()
    const bytes = Buffer.from(await file.arrayBuffer())
    const safeName = sanitizeFilename(file.name || 'upload.bin')
    const ext = safeName.includes('.') ? safeName.split('.').pop() : 'bin'
    const path = `${context.brand_id}/${assetType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    const fileUrl = publicUrlData.publicUrl

    const { data: asset, error: insertError } = await supabase
      .from('brand_assets')
      .insert([{
        brand_id: context.brand_id,
        asset_type: assetType,
        file_url: fileUrl,
        is_primary: isPrimary
      }])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      asset
    })
  } catch (error: any) {
    console.error('POST /api/brand-assets/upload error:', error)
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen', details: error.message },
      { status: 500 }
    )
  }
}
