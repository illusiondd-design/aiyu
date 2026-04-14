import { createClient } from '@/utils/supabase/server'
import { buildLeadWorkbook } from '@/utils/leadXlsx'
import * as XLSX from 'xlsx'

export async function GET() {
  const supabase = await createClient()

  const { data: leads, error } = await supabase
    .from('upgrade_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2000)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  const workbook = buildLeadWorkbook(leads || [])
  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  })

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const filename = `postmeister_leads__${stamp}.xlsx`

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
