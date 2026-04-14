'use client'

import { useEffect, useMemo, useState } from 'react'

type PublishJob = {
  id: number
  post_id: number
  platform: string
  status: string
  provider?: string | null
  external_post_id?: string | null
  published_url?: string | null
  error_message?: string | null
  payload?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export default function PublishJobsPanel() {
  const [jobs, setJobs] = useState<PublishJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postId, setPostId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function loadJobs(postIdFilter?: string) {
    try {
      setLoading(true)
      setError(null)

      const query = postIdFilter?.trim()
        ? `/api/publish/job/list?post_id=${encodeURIComponent(postIdFilter.trim())}&limit=50`
        : '/api/publish/job/list?limit=50'

      const res = await fetch(query, { cache: 'no-store' })
      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Publish-Jobs konnten nicht geladen werden.')
      }

      const nextJobs = (Array.isArray(json.data) ? json.data : []).sort(
        (a: any, b: any) =>
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
      )

      setJobs(nextJobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    let result = jobs

    if (statusFilter !== 'all') {
      result = result.filter((job) => (job.status || '').toLowerCase() === statusFilter)
    }

    return result
  }, [jobs, statusFilter])

  const stats = useMemo(() => {
    const queued = jobs.filter((job) => (job.status || '').toLowerCase() === 'queued').length
    const processing = jobs.filter((job) => (job.status || '').toLowerCase() === 'processing').length
    const published = jobs.filter((job) => (job.status || '').toLowerCase() === 'published').length
    const failed = jobs.filter((job) => (job.status || '').toLowerCase() === 'failed').length

    return {
      total: jobs.length,
      queued,
      processing,
      published,
      failed,
    }
  }, [jobs])

  return (
    <div
      style={{
        background: '#151515',
        border: '1px solid #2a2a2a',
        borderRadius: 14,
        padding: 16,
        color: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Publish Jobs</h2>
          <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: 13 }}>
            Monitoring-Ansicht der echten Publish-Jobs. Steuerung erfolgt im Pipeline-Board.
          </p>
        </div>

        <button onClick={() => loadJobs(postId)} style={buttonStyle}>
          Neu laden
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <StatCard label="Gesamt" value={stats.total} />
        <StatCard label="Queued" value={stats.queued} />
        <StatCard label="Processing" value={stats.processing} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Failed" value={stats.failed} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 14,
          alignItems: 'center',
        }}
      >
        <input
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="Post-ID"
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="all">Alle Status</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>

        <button onClick={() => loadJobs(postId)} style={buttonStyle}>
          Filtern
        </button>

        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          Dieses Panel ist read-only.
        </span>
      </div>

      {loading && <p style={{ color: '#d1d5db' }}>Lade Publish-Jobs ...</p>}
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 1150,
              background: '#101010',
              borderRadius: 10,
            }}
          >
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Post</Th>
                <Th>Plattform</Th>
                <Th>Status</Th>
                <Th>Provider</Th>
                <Th>External ID</Th>
                <Th>Published URL</Th>
                <Th>Fehler</Th>
                <Th>Payload</Th>
                <Th>Zeit</Th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  style={{
                    background:
                      job.status === 'queued'
                        ? 'rgba(59,130,246,0.08)'
                        : job.status === 'processing'
                        ? 'rgba(234,179,8,0.08)'
                        : 'transparent',
                  }}
                >
                  <Td>{job.id}</Td>
                  <Td>{job.post_id}</Td>
                  <Td>{job.platform}</Td>
                  <Td>{statusBadge(job.status)}</Td>
                  <Td>{job.provider || '-'}</Td>
                  <Td>{job.external_post_id || '-'}</Td>
                  <Td style={{ maxWidth: 220, wordBreak: 'break-all' }}>
                    {job.published_url || '-'}
                  </Td>
                  <Td style={{ maxWidth: 240, wordBreak: 'break-word' }}>
                    {job.error_message || '-'}
                  </Td>
                  <Td style={{ maxWidth: 260, wordBreak: 'break-word', color: '#d1d5db' }}>
                    {job.payload ? JSON.stringify(job.payload) : '-'}
                  </Td>
                  <Td>
                    {formatDate(job.created_at)}
                    <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>
                      updated: {formatDate(job.updated_at)}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredJobs.length === 0 && (
            <div
              style={{
                padding: 14,
                borderTop: '1px solid #222',
                color: '#9ca3af',
                fontSize: 13,
              }}
            >
              Keine Publish-Jobs vorhanden.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('de-DE')
}

function statusBadge(status?: string | null) {
  const s = (status || '').toLowerCase()

  let background = '#202020'
  let color = '#e5e7eb'
  let border = '#333'

  if (s === 'published') {
    background = 'rgba(22,163,74,0.14)'
    color = '#86efac'
    border = 'rgba(22,163,74,0.35)'
  } else if (s === 'queued') {
    background = 'rgba(59,130,246,0.14)'
    color = '#93c5fd'
    border = 'rgba(59,130,246,0.35)'
  } else if (s === 'processing') {
    background = 'rgba(234,179,8,0.14)'
    color = '#fde68a'
    border = 'rgba(234,179,8,0.35)'
  } else if (s === 'failed') {
    background = 'rgba(239,68,68,0.14)'
    color = '#fca5a5'
    border = 'rgba(239,68,68,0.35)'
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: 999,
        background,
        color,
        border: `1px solid ${border}`,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {status || '-'}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: '1px solid #262626',
        borderRadius: 12,
        padding: 12,
        background: '#0f0f0f',
      }}
    >
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: 12,
        borderBottom: '1px solid #262626',
        color: '#e5e7eb',
        fontSize: 13,
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <td
      style={{
        padding: 12,
        borderBottom: '1px solid #202020',
        color: '#fff',
        fontSize: 13,
        verticalAlign: 'top',
        ...style,
      }}
    >
      {children}
    </td>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #3a3a3a',
  background: '#0f0f0f',
  color: '#fff',
  minWidth: 160,
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #3a3a3a',
  background: '#0f0f0f',
  color: '#fff',
  cursor: 'pointer',
}
