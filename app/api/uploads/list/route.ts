import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export const dynamic = 'force-dynamic'

type UploadItem = {
  id: string
  title: string
  hook: string
  status: 'ready'
  duration: string
  platform: string
  caption: string
  cta: string
  hashtags: string[]
  previewUrl: string
  downloadUrl: string
  createdAt: number
}

function formatGermanDate(value: number) {
  const date = new Date(value)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

function extensionLabel(fileName: string) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.mov') return 'MOV Upload'
  if (ext === '.mp4') return 'MP4 Upload'
  if (ext === '.webm') return 'WEBM Upload'
  if (ext === '.m4v') return 'M4V Upload'
  return 'Video Upload'
}

function isUuidLikeToken(token: string) {
  return /^[0-9a-fA-F]{4,12}$/.test(token)
}

function cleanupHook(rawName: string, fileName: string) {
  const normalized = rawName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  const tokens = normalized.split(/\s+/).filter(Boolean)

  const cleaned = tokens.filter((token) => {
    if (/^\d{13,}$/.test(token)) return false
    if (/^copy$/i.test(token)) return false
    if (isUuidLikeToken(token)) return false
    return true
  })

  const value = cleaned.join(' ').trim()

  if (!value || /^\d+$/.test(value)) return extensionLabel(fileName)
  if (value.length > 60) return value.slice(0, 60).trim()
  return value
}

function buildReadableNames(fileName: string, createdAt: number) {
  const withoutExt = fileName.replace(/\.[^.]+$/, '')
  const parts = withoutExt.split('__')
  const rawName = parts.length > 1 ? parts.slice(1).join('__') : withoutExt

  return {
    title: `Upload ${formatGermanDate(createdAt)}`,
    hook: cleanupHook(rawName, fileName),
  }
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '-'

  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60

  if (mins <= 0) return `0:${String(secs).padStart(2, '0')}`
  return `${mins}:${String(secs).padStart(2, '0')}`
}

async function getVideoDuration(filePath: string) {
  try {
    const { stdout } = await execFileAsync('/usr/bin/ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])

    const seconds = Number.parseFloat((stdout || '').trim())
    return formatDuration(seconds)
  } catch {
    return '-'
  }
}

function shouldHideFile(fileName: string, duration: string) {
  const lower = fileName.toLowerCase()

  if (lower.includes('test-15mb')) return true
  if (lower.includes('test_15mb')) return true
  if (duration === '-') return true

  return false
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'storage', 'uploads', 'videos')
    await fs.mkdir(dir, { recursive: true })

    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = entries.filter((entry) => entry.isFile())

    const rawItems: UploadItem[] = await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(dir, file.name)
        const stat = await fs.stat(fullPath)
        const readable = buildReadableNames(file.name, stat.mtimeMs)
        const duration = await getVideoDuration(fullPath)

        return {
          id: file.name,
          title: readable.title,
          hook: readable.hook,
          status: 'ready',
          duration,
          platform: 'Upload',
          caption: 'Hochgeladene Datei',
          cta: 'Weiterverarbeiten',
          hashtags: [],
          previewUrl: `/api/uploads/file/${encodeURIComponent(file.name)}`,
          downloadUrl: `/api/uploads/file/${encodeURIComponent(file.name)}`,
          createdAt: stat.mtimeMs,
        }
      })
    )

    const items = rawItems
      .filter((item) => !shouldHideFile(item.id, item.duration))
      .sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('UPLOAD_LIST_ERROR', error)
    return NextResponse.json(
      { success: false, error: 'Upload-Liste konnte nicht geladen werden.' },
      { status: 500 }
    )
  }
}
