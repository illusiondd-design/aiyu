import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createClient } from '@/utils/supabase/server'
import { readReminderLog } from '@/utils/telegramReminderLog'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Lead = {
  id?: string
  name?: string | null
  email?: string | null
  requested_package?: string | null
  lead_score?: number | null
  lead_type?: string | null
  status?: string | null
  hot_alert_sent?: boolean | null
  follow_up_at?: string | null
  internal_note?: string | null
  message?: string | null
  priority?: string | null
  closed?: boolean | null
  created_at?: string | null
}

function toStartOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isOverdue(value?: string | null, closed?: boolean | null) {
  if (!value || closed === true) return false
  const today = toStartOfDay(new Date())
  const date = toStartOfDay(new Date(value))
  if (Number.isNaN(date.getTime())) return false
  return date < today
}

function isToday(value?: string | null, closed?: boolean | null) {
  if (!value || closed === true) return false
  const today = toStartOfDay(new Date())
  const date = toStartOfDay(new Date(value))
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() === today.getTime()
}

function formatDateTimeDE(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('de-DE')
}

function truncate(value: string, max = 80) {
  if (!value) return '-'
  return value.length > max ? value.slice(0, max - 1) + '…' : value
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  size: number,
  font: any,
  color = rgb(0.07, 0.09, 0.13)
) {
  page.drawText(String(text ?? ''), { x, y, size, font, color })
}

function drawWrappedText(
  page: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: any,
  lineHeight = 14,
  color = rgb(0.07, 0.09, 0.13)
) {
  const words = String(text ?? '').split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(test, size)
    if (width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)

  let currentY = y
  for (const line of lines) {
    page.drawText(line, { x, y: currentY, size, font, color })
    currentY -= lineHeight
  }

  return currentY
}

function drawRect(page: any, x: number, y: number, w: number, h: number, fill: any, border?: any) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: fill,
    borderColor: border || fill,
    borderWidth: border ? 1 : 0,
  })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const automationLog = readReminderLog()

    const { data: leads, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (error) {
      return new Response(`Supabase error: ${error.message}`, { status: 500 })
    }

    const all: Lead[] = leads || []
    const openStatuses = ['new', 'processing', 'notified', 'missing_email']

    const totalLeads = all.length
    const openLeads = all.filter((l) => openStatuses.includes(l.status || '')).length
    const hotLeads = all.filter((l) => (l.lead_type || '').toLowerCase() === 'hot' && l.closed !== true)
    const dueLeads = all.filter((l) => isOverdue(l.follow_up_at, l.closed) || isToday(l.follow_up_at, l.closed))
    const overdueCount = all.filter((l) => isOverdue(l.follow_up_at, l.closed)).length
    const todayCount = all.filter((l) => isToday(l.follow_up_at, l.closed)).length

    const pdf = await PDFDocument.create()
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

    let page = pdf.addPage([595, 842])
    const { width, height } = page.getSize()
    let y = height - 50

    // Header
    drawText(page, 'POSTMEISTER', 50, y, 24, fontBold)
    drawText(page, 'Management Report', 50, y - 26, 16, fontRegular, rgb(0.31, 0.27, 0.9))
    drawText(page, `Erstellt am ${new Date().toLocaleString('de-DE')}`, 50, y - 46, 10, fontRegular, rgb(0.42, 0.46, 0.53))

    drawRect(page, 360, y - 12, 185, 74, rgb(0.07, 0.09, 0.13))
    drawText(page, 'Automation Status', 375, y + 18, 13, fontBold, rgb(1, 1, 1))
    drawText(page, `Status: ${automationLog.last_status || 'unknown'}`, 375, y - 2, 10, fontRegular, rgb(1, 1, 1))
    drawText(page, `Letzter Versand: ${formatDateTimeDE(automationLog.last_sent_at)}`, 375, y - 17, 10, fontRegular, rgb(1, 1, 1))

    y -= 105

    // KPI section
    drawText(page, 'KPI Übersicht', 50, y, 15, fontBold)
    y -= 18
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.82, 0.85, 0.9),
    })
    y -= 18

    const kpis = [
      ['Gesamtleads', totalLeads],
      ['Offene Leads', openLeads],
      ['Hot Leads', hotLeads.length],
      ['Überfällig', overdueCount],
      ['Heute fällig', todayCount],
      ['Reminder Versand', automationLog.last_sent_count || 0],
    ]

    kpis.forEach((item, i) => {
      const row = Math.floor(i / 3)
      const col = i % 3
      const x = 50 + col * 166
      const by = y - row * 68

      drawRect(page, x, by - 44, 156, 58, rgb(0.97, 0.98, 0.99), rgb(0.82, 0.85, 0.9))
      drawText(page, String(item[0]), x + 10, by - 10, 10, fontRegular, rgb(0.42, 0.46, 0.53))
      drawText(page, String(item[1]), x + 10, by - 30, 20, fontBold)
    })

    y -= 150

    // Summary
    drawText(page, 'Management Summary', 50, y, 15, fontBold)
    y -= 18
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.82, 0.85, 0.9),
    })
    y -= 18

    y = drawWrappedText(
      page,
      `Postmeister verwaltet aktuell ${totalLeads} Leads. Davon sind ${openLeads} offen. ${hotLeads.length} Leads sind als HOT klassifiziert. ${overdueCount} Follow-ups sind überfällig, ${todayCount} sind heute fällig. Der letzte Telegram-Digest hatte den Status "${automationLog.last_status || 'unknown'}".`,
      50,
      y,
      495,
      10,
      fontRegular,
      14
    )

    y -= 18

    function ensurePage(spaceNeeded = 120) {
      if (y < spaceNeeded) {
        page = pdf.addPage([595, 842])
        y = page.getSize().height - 50
      }
    }

    function drawTable(title: string, headers: string[], rows: string[][], colWidths: number[]) {
      ensurePage(180)

      drawText(page, title, 50, y, 15, fontBold)
      y -= 18
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.82, 0.85, 0.9),
      })
      y -= 18

      const tableX = 50
      const rowH = 20
      const totalW = colWidths.reduce((a, b) => a + b, 0)

      drawRect(page, tableX, y - rowH + 5, totalW, rowH, rgb(0.07, 0.09, 0.13))
      let x = tableX
      headers.forEach((h, i) => {
        drawText(page, h, x + 5, y - 9, 8.5, fontBold, rgb(1, 1, 1))
        x += colWidths[i]
      })
      y -= rowH

      rows.forEach((row, idx) => {
        ensurePage(80)
        const fill = idx % 2 === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1)
        drawRect(page, tableX, y - rowH + 5, totalW, rowH, fill, rgb(0.9, 0.91, 0.93))
        let cx = tableX
        row.forEach((cell, i) => {
          drawText(page, truncate(cell, 28), cx + 5, y - 9, 8, fontRegular)
          cx += colWidths[i]
        })
        y -= rowH
      })

      y -= 16
    }

    drawTable(
      'Top Hot Leads',
      ['Name', 'Paket', 'Score', 'Priorität', 'Status', 'Follow-up'],
      hotLeads.slice(0, 10).map((lead) => [
        String(lead.name || '-'),
        String(lead.requested_package || '-'),
        String(lead.lead_score ?? '-'),
        String(lead.priority || '-'),
        String(lead.status || '-'),
        String(formatDateTimeDE(lead.follow_up_at)),
      ]),
      [120, 95, 50, 65, 70, 95]
    )

    drawTable(
      'Fällige Leads',
      ['Name', 'Typ', 'Priorität', 'Status', 'Follow-up', 'Hinweis'],
      dueLeads.slice(0, 12).map((lead) => [
        String(lead.name || '-'),
        String(lead.lead_type || '-'),
        String(lead.priority || '-'),
        String(lead.status || '-'),
        String(formatDateTimeDE(lead.follow_up_at)),
        isOverdue(lead.follow_up_at, lead.closed) ? 'überfällig' : 'heute',
      ]),
      [115, 55, 65, 70, 115, 75]
    )

    ensurePage(120)
    drawText(page, 'Automation Detail', 50, y, 15, fontBold)
    y -= 18
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.82, 0.85, 0.9),
    })
    y -= 18

    const details = [
      `Letzter Versandtag: ${automationLog.last_sent_date || '-'}`,
      `Letzter Versandzeitpunkt: ${formatDateTimeDE(automationLog.last_sent_at)}`,
      `Letzte Versandanzahl: ${automationLog.last_sent_count ?? 0}`,
      `Letzter Status: ${automationLog.last_status || '-'}`,
      `Letzter Fehler/Hinweis: ${automationLog.last_error || '-'}`,
    ]

    details.forEach((line) => {
      drawText(page, line, 50, y, 10, fontRegular)
      y -= 15
    })

    y -= 10
    drawText(
      page,
      'Dieser Report wurde automatisch aus dem aktuellen Postmeister-Dashboard generiert.',
      50,
      y,
      9,
      fontRegular,
      rgb(0.42, 0.46, 0.53)
    )

    const bytes = await pdf.save()
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = `postmeister_management_report__${stamp}.pdf`

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(bytes.length),
      },
    })
  } catch (error: any) {
    return new Response(`PDF route error: ${error?.stack || error?.message || 'Unknown error'}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}
