'use client'

import { useEffect, useMemo, useState } from 'react'

type PostItem = {
  id: number
  platform: string
  content: string
  caption: string
  hashtags: string[]
  batch_id: string
  review_status: string
  created_at: string
  scheduled_for?: string | null
  published_at?: string | null
  publish_error?: string | null
  publish_attempted_at?: string | null
  publish_mode?: string | null
}

type BatchGroup = {
  batch_id: string
  review_status: string
  created_at: string
  posts: PostItem[]
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'scheduled', 'published']
const PLATFORM_OPTIONS = ['', 'instagram', 'facebook', 'linkedin', 'tiktok']

const colors = {
  pageBg: '#050505',
  cardBg: '#111111',
  cardBorder: '#2a2a2a',
  text: '#f5f5f5',
  textSoft: '#b3b3b3',
  textDim: '#8a8a8a',
  chipBg: '#1c1c1c',
  chipText: '#e8e8e8',
  inputBg: '#101010',
  inputBorder: '#2f2f2f',
  approveBg: '#1f6f43',
  approveText: '#ffffff',
  rejectBg: '#8b2e2e',
  rejectText: '#ffffff',
  pendingBg: '#444444',
  pendingText: '#ffffff',
  scheduleBg: '#2457a6',
  scheduleText: '#ffffff',
  publishBg: '#7a4cff',
  publishText: '#ffffff',
}

export default function ReviewPage() {
  const [batches, setBatches] = useState<BatchGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [busyBatch, setBusyBatch] = useState<string | null>(null)
  const [status, setStatus] = useState('pending')
  const [platform, setPlatform] = useState('')
  const [scheduleValues, setScheduleValues] = useState<Record<number, string>>({})

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (platform) params.set('platform', platform)
    params.set('limit', '200')
    return params.toString()
  }, [status, platform])

  const allPosts = useMemo(() => batches.flatMap((b) => b.posts), [batches])

  const stats = useMemo(() => {
    const platformCounts = allPosts.reduce<Record<string, number>>((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1
      return acc
    }, {})

    return {
      totalPosts: allPosts.length,
      totalBatches: batches.length,
      instagram: platformCounts.instagram || 0,
      facebook: platformCounts.facebook || 0,
      linkedin: platformCounts.linkedin || 0,
      tiktok: platformCounts.tiktok || 0,
    }
  }, [allPosts, batches])

  async function loadBatches() {
    setLoading(true)
    try {
      const res = await fetch(`/api/review/batches?${queryString}`, { cache: 'no-store' })
      const json = await res.json()
      setBatches(json.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [queryString])

  async function updateStatus(id: number, review_status: string) {
    setBusyId(id)
    try {
      const res = await fetch('/api/posts/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, review_status }),
      })

      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Status-Update fehlgeschlagen')
        return
      }

      await loadBatches()
    } finally {
      setBusyId(null)
    }
  }

  async function updateBatchStatus(batch_id: string, review_status: string) {
    setBusyBatch(batch_id)
    try {
      const res = await fetch('/api/review/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id, review_status }),
      })

      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Batch-Update fehlgeschlagen')
        return
      }

      await loadBatches()
    } finally {
      setBusyBatch(null)
    }
  }

  async function schedulePost(id: number) {
    const scheduled_for = scheduleValues[id]
    if (!scheduled_for) {
      alert('Bitte Datum und Uhrzeit setzen')
      return
    }

    setBusyId(id)
    try {
      const res = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          scheduled_for: new Date(scheduled_for).toISOString(),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Scheduling fehlgeschlagen')
        return
      }

      await loadBatches()
    } finally {
      setBusyId(null)
    }
  }

  async function publishPost(id: number) {
    setBusyId(id)
    try {
      const res = await fetch('/api/publish/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Publishing fehlgeschlagen')
        return
      }

      await loadBatches()
    } finally {
      setBusyId(null)
    }
  }

  async function resetPublishState(id: number) {
    setBusyId(id)
    try {
      const res = await fetch('/api/publish/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, review_status: 'pending' }),
      })

      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Reset fehlgeschlagen')
        return
      }

      await loadBatches()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1280,
        margin: '0 auto',
        background: colors.pageBg,
        minHeight: '100vh',
        color: colors.text,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20, color: colors.text }}>
        PostMeister Review
      </h1>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          ['Posts', stats.totalPosts],
          ['Batches', stats.totalBatches],
          ['Instagram', stats.instagram],
          ['Facebook', stats.facebook],
          ['LinkedIn', stats.linkedin],
          ['TikTok', stats.tiktok],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: 14,
              background: colors.cardBg,
            }}
          >
            <div style={{ fontSize: 13, color: colors.textSoft, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{value}</div>
          </div>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: colors.textSoft }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              background: colors.inputBg,
              color: colors.text,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: 10,
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, color: colors.textSoft }}>Plattform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              background: colors.inputBg,
              color: colors.text,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: 10,
            }}
          >
            <option value=''>alle</option>
            {PLATFORM_OPTIONS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <p style={{ color: colors.textSoft }}>Lade Batches ...</p>
      ) : batches.length === 0 ? (
        <p style={{ color: colors.textSoft }}>Keine Batches gefunden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {batches.map((batch) => (
            <section
              key={batch.batch_id}
              style={{
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 14,
                padding: 18,
                background: colors.cardBg,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>
                  Batch: {batch.batch_id}
                </div>
                <div style={{ fontSize: 13, color: colors.textDim, marginTop: 4 }}>
                  Status: {batch.review_status} · Posts: {batch.posts.length} · {new Date(batch.created_at).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                  onClick={() => updateBatchStatus(batch.batch_id, 'approved')}
                  disabled={busyBatch === batch.batch_id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: 'none',
                    background: colors.approveBg,
                    color: colors.approveText,
                    fontWeight: 600,
                  }}
                >
                  Batch Approve
                </button>

                <button
                  onClick={() => updateBatchStatus(batch.batch_id, 'rejected')}
                  disabled={busyBatch === batch.batch_id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: 'none',
                    background: colors.rejectBg,
                    color: colors.rejectText,
                    fontWeight: 600,
                  }}
                >
                  Batch Reject
                </button>

                <button
                  onClick={() => updateBatchStatus(batch.batch_id, 'pending')}
                  disabled={busyBatch === batch.batch_id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: 'none',
                    background: colors.pendingBg,
                    color: colors.pendingText,
                    fontWeight: 600,
                  }}
                >
                  Batch Reset
                </button>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                {batch.posts.map((post) => (
                  <article
                    key={post.id}
                    style={{
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 12,
                      padding: 16,
                      background: '#0b0b0b',
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, color: colors.text }}>
                        #{post.id} · {post.platform} · {post.review_status}
                      </div>
                      <div style={{ fontSize: 13, color: colors.textDim, marginTop: 4 }}>
                        {new Date(post.created_at).toLocaleString()}
                        {post.scheduled_for ? ` · Geplant: ${new Date(post.scheduled_for).toLocaleString()}` : ''}
                        {post.published_at ? ` · Veröffentlicht: ${new Date(post.published_at).toLocaleString()}` : ''}
                        {post.publish_attempted_at ? ` · Letzter Versuch: ${new Date(post.publish_attempted_at).toLocaleString()}` : ''}
                      </div>

                      {post.publish_error ? (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: '#3a1515',
                            color: '#ffb3b3',
                            border: '1px solid #5a2222',
                            fontSize: 13,
                          }}
                        >
                          Publish-Fehler: {post.publish_error}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, color: colors.textSoft }}>Content</div>
                      <div style={{ whiteSpace: 'pre-wrap', color: colors.text }}>{post.content}</div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, color: colors.textSoft }}>Caption</div>
                      <div style={{ whiteSpace: 'pre-wrap', color: colors.text }}>{post.caption}</div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, color: colors.textSoft }}>Hashtags</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(post.hashtags || []).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 999,
                              background: colors.chipBg,
                              color: colors.chipText,
                              fontSize: 13,
                              border: `1px solid ${colors.cardBorder}`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, marginBottom: 12 }}>
                      <input
                        type="datetime-local"
                        value={scheduleValues[post.id] || ''}
                        onChange={(e) =>
                          setScheduleValues((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          padding: 10,
                          background: colors.inputBg,
                          color: colors.text,
                          border: `1px solid ${colors.inputBorder}`,
                          borderRadius: 10,
                        }}
                      />
                      <button
                        onClick={() => schedulePost(post.id)}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                          background: colors.scheduleBg,
                          color: colors.scheduleText,
                          fontWeight: 600,
                        }}
                      >
                        Schedule
                      </button>

                      <button
                        onClick={() => publishPost(post.id)}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                          background: colors.publishBg,
                          color: colors.publishText,
                          fontWeight: 600,
                        }}
                      >
                        Publish Now
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateStatus(post.id, 'approved')}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                          background: colors.approveBg,
                          color: colors.approveText,
                          fontWeight: 600,
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(post.id, 'rejected')}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                          background: colors.rejectBg,
                          color: colors.rejectText,
                          fontWeight: 600,
                        }}
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => updateStatus(post.id, 'pending')}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: 'none',
                          background: colors.pendingBg,
                          color: colors.pendingText,
                          fontWeight: 600,
                        }}
                      >
                        Reset to Pending
                      </button>

                      <button
                        onClick={() => resetPublishState(post.id)}
                        disabled={busyId === post.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid #555',
                          background: 'transparent',
                          color: colors.text,
                          fontWeight: 600,
                        }}
                      >
                        Reset Publish State
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
