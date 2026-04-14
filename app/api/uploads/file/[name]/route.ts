import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase()

  switch (ext) {
    case '.mp4':
      return 'video/mp4'
    case '.mov':
      return 'video/quicktime'
    case '.webm':
      return 'video/webm'
    case '.m4v':
      return 'video/x-m4v'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const params = await context.params
    const name = decodeURIComponent(params.name || '')

    if (!name || name.includes('/') || name.includes('\\')) {
      return NextResponse.json({ success: false, error: 'Ungültiger Dateiname.' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'storage', 'uploads', 'videos', name)
    const buffer = await fs.readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': getContentType(name),
        'Content-Disposition': `inline; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('UPLOAD_FILE_ERROR', error)
    return NextResponse.json(
      { success: false, error: 'Datei konnte nicht geladen werden.' },
      { status: 404 }
    )
  }
}
