import { createClient } from '@/utils/supabase/server'
import { leadsToCsv } from '@/utils/leadCsv'

export async function GET() {
  const supabase = await createClient()

  const { data: leads, error } = await supabase
    .from('upgrade_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  const csv = leadsToCsv(leads || [])
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const filename = `postmeister_leads__${stamp}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
