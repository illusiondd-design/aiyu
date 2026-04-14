'use client'

import React, { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  formatLeadDate,
  getLeadPriorityBarClass,
  isLeadDueToday,
  isLeadOverdue,
} from '@/utils/kanbanLeadStyles'

type Lead = {
  id: string
  name: string | null
  email: string | null
  requested_package: string | null
  lead_score: number | null
  lead_type: string | null
  status: string | null
  hot_alert_sent: boolean | null
  follow_up_at: string | null
  internal_note: string | null
  message: string | null
  priority?: string | null
  closed?: boolean | null
}

type Column = {
  key: string
  title: string
}

type FilterMode =
  | 'all'
  | 'urgent'
  | 'overdue'
  | 'today'
  | 'hot'
  | 'open'

export default function LeadsKanban({
  initialLeads,
}: {
  initialLeads: Lead[]
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [autoScoring, setAutoScoring] = useState(false)
  const [hotSaving, setHotSaving] = useState(false)
  const [reminderSaving, setReminderSaving] = useState(false)
  const [telegramSending, setTelegramSending] = useState(false)
  const [exportingSystem, setExportingSystem] = useState(false)
  const [csvExporting, setCsvExporting] = useState(false)
  const [xlsxExporting, setXlsxExporting] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)

  const columns: Column[] = [
    { key: 'new', title: 'Neu' },
    { key: 'processing', title: 'Processing' },
    { key: 'notified', title: 'Notified' },
    { key: 'missing_email', title: 'Missing Email' },
    { key: 'closed', title: 'Closed' },
  ]

  const sensors = useSensors(useSensor(PointerSensor))

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const overdue = isLeadOverdue(lead.follow_up_at, lead.closed)
      const dueToday = isLeadDueToday(lead.follow_up_at, lead.closed)
      const isHot = (lead.lead_type || '').toLowerCase() === 'hot'
      const isOpen = ['new', 'processing', 'notified', 'missing_email'].includes(
        lead.status || ''
      )

      if (filterMode === 'all') return true
      if (filterMode === 'urgent') return overdue || dueToday
      if (filterMode === 'overdue') return overdue
      if (filterMode === 'today') return dueToday
      if (filterMode === 'hot') return isHot
      if (filterMode === 'open') return isOpen

      return true
    })
  }, [leads, filterMode])

  const grouped = useMemo(() => {
    return Object.fromEntries(
      columns.map((col) => [
        col.key,
        filteredLeads.filter((lead) => (lead.status || 'new') === col.key),
      ])
    )
  }, [filteredLeads])

  async function handleDragEnd(event: DragEndEvent) {
    const leadId = String(event.active.id)
    const targetStatus = event.over?.id ? String(event.over.id) : null

    if (!targetStatus) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === targetStatus) return

    const previous = leads

    setLeads((curr) =>
      curr.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: targetStatus,
              closed: targetStatus === 'closed' ? true : l.closed,
            }
          : l
      )
    )
    setSavingId(leadId)

    try {
      const res = await fetch('/api/leads/update-status-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: targetStatus }),
      })

      if (!res.ok) {
        throw new Error('Status update failed')
      }
    } catch {
      setLeads(previous)
      alert('Status konnte nicht gespeichert werden.')
    } finally {
      setSavingId(null)
    }
  }

  async function updateLeadFollowUp(
    id: string,
    payload: {
      follow_up_at?: string
      closed?: boolean
    }
  ) {
    const previous = leads

    setSavingId(id)
    setLeads((curr) =>
      curr.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              ...(payload.follow_up_at !== undefined
                ? { follow_up_at: payload.follow_up_at }
                : {}),
              ...(payload.closed !== undefined
                ? {
                    closed: payload.closed,
                    status: payload.closed ? 'closed' : lead.status,
                  }
                : {}),
            }
          : lead
      )
    )

    try {
      const res = await fetch('/api/leads/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Follow-up update failed')
      }

      if (json?.lead) {
        setLeads((curr) =>
          curr.map((lead) => (lead.id === id ? { ...lead, ...json.lead } : lead))
        )
      }
    } catch (error: any) {
      setLeads(previous)
      alert(error?.message || 'Follow-up konnte nicht gespeichert werden.')
    } finally {
      setSavingId(null)
    }
  }

  async function bulkUpdateLeads(ids: string[], updates: Record<string, any>) {
    if (!ids.length) return

    const previous = leads
    setBulkSaving(true)

    setLeads((curr) =>
      curr.map((lead) =>
        ids.includes(lead.id)
          ? {
              ...lead,
              ...updates,
              ...(updates.closed === true ? { status: 'closed' } : {}),
            }
          : lead
      )
    )

    try {
      const res = await fetch('/api/leads/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Bulk update failed')
      }

      if (Array.isArray(json?.leads)) {
        setLeads((curr) =>
          curr.map((lead) => {
            const updated = json.leads.find((item: Lead) => item.id === lead.id)
            return updated ? { ...lead, ...updated } : lead
          })
        )
      }
    } catch (error: any) {
      setLeads(previous)
      alert(error?.message || 'Bulk-Aktion konnte nicht gespeichert werden.')
    } finally {
      setBulkSaving(false)
    }
  }

  async function updateReminderState(ids: string[], hot_alert_sent: boolean) {
    if (!ids.length) {
      alert('Keine passenden Leads für Reminder-Aktion.')
      return
    }

    const previous = leads
    setReminderSaving(true)

    setLeads((curr) =>
      curr.map((lead) =>
        ids.includes(lead.id)
          ? { ...lead, hot_alert_sent }
          : lead
      )
    )

    try {
      const res = await fetch('/api/leads/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, hot_alert_sent }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Reminder-Aktion fehlgeschlagen')
      }

      if (Array.isArray(json?.leads)) {
        setLeads((curr) =>
          curr.map((lead) => {
            const updated = json.leads.find((item: Lead) => item.id === lead.id)
            return updated ? { ...lead, ...updated } : lead
          })
        )
      }
    } catch (error: any) {
      setLeads(previous)
      alert(error?.message || 'Reminder konnte nicht gespeichert werden.')
    } finally {
      setReminderSaving(false)
    }
  }

  async function runAutoScoring() {
    setAutoScoring(true)

    try {
      const res = await fetch('/api/leads/auto-score', {
        method: 'POST',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Auto-Scoring fehlgeschlagen')
      }

      if (Array.isArray(json?.leads)) {
        setLeads((curr) =>
          curr.map((lead) => {
            const updated = json.leads.find((item: Lead) => item.id === lead.id)
            return updated ? { ...lead, ...updated } : lead
          })
        )
      }
    } catch (error: any) {
      alert(error?.message || 'Auto-Scoring konnte nicht ausgeführt werden.')
    } finally {
      setAutoScoring(false)
    }
  }

  async function runHotLeadAlert(targetStatus: 'notified' | 'processing') {
    const ids = leads
      .filter((lead) => (lead.lead_type || '').toLowerCase() === 'hot')
      .filter((lead) => lead.closed !== true)
      .filter((lead) => lead.hot_alert_sent !== true)
      .map((lead) => lead.id)

    if (!ids.length) {
      alert('Keine neuen Hot Leads für diese Aktion.')
      return
    }

    const previous = leads
    setHotSaving(true)

    setLeads((curr) =>
      curr.map((lead) =>
        ids.includes(lead.id)
          ? {
              ...lead,
              hot_alert_sent: true,
              status: targetStatus,
            }
          : lead
      )
    )

    try {
      const res = await fetch('/api/leads/hot-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, targetStatus }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Hot-Lead-Aktion fehlgeschlagen')
      }

      if (Array.isArray(json?.leads)) {
        setLeads((curr) =>
          curr.map((lead) => {
            const updated = json.leads.find((item: Lead) => item.id === lead.id)
            return updated ? { ...lead, ...updated } : lead
          })
        )
      }
    } catch (error: any) {
      alert(error?.message || 'Hot-Lead-Aktion konnte nicht gespeichert werden.')
    } finally {
      setHotSaving(false)
    }
  }

  async function sendTelegramReminder() {
    setTelegramSending(true)

    try {
      const res = await fetch('/api/leads/telegram-reminder', {
        method: 'POST',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Telegram-Reminder fehlgeschlagen')
      }

      alert(`Telegram-Reminder gesendet. Leads im Digest: ${json?.sent_count ?? 0}`)
    } catch (error: any) {
      alert(error?.message || 'Telegram-Reminder konnte nicht gesendet werden.')
    } finally {
      setTelegramSending(false)
    }
  }

  async function forceDailyTelegramCron() {
    setTelegramSending(true)

    try {
      const secret = window.prompt('CRON_SECRET eingeben für Force-Run:')
      if (!secret) {
        setTelegramSending(false)
        return
      }

      const res = await fetch('/api/cron/daily-telegram-reminder?force=1', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Force-Cron fehlgeschlagen')
      }

      alert(`Force-Cron erfolgreich. Leads im Digest: ${json?.sent_count ?? 0}`)
      window.location.reload()
    } catch (error: any) {
      alert(error?.message || 'Force-Cron konnte nicht ausgeführt werden.')
    } finally {
      setTelegramSending(false)
    }
  }





  async function exportPdfReport() {
    setPdfExporting(true)

    try {
      const res = await fetch('/api/reports/management-pdf')

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'PDF-Report fehlgeschlagen')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'postmeister_management_report.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error?.message || 'PDF-Report konnte nicht erstellt werden.')
    } finally {
      setPdfExporting(false)
    }
  }

  async function exportXlsx() {
    setXlsxExporting(true)

    try {
      const res = await fetch('/api/leads/export-xlsx')

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'XLSX-Export fehlgeschlagen')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'postmeister_leads.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error?.message || 'XLSX-Export konnte nicht erstellt werden.')
    } finally {
      setXlsxExporting(false)
    }
  }


  async function exportCsv() {
    setCsvExporting(true)

    try {
      const res = await fetch('/api/leads/export-csv')

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'CSV-Export fehlgeschlagen')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'postmeister_leads.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error?.message || 'CSV-Export konnte nicht erstellt werden.')
    } finally {
      setCsvExporting(false)
    }
  }

  async function exportSystemArtifacts() {
    setExportingSystem(true)

    try {
      const res = await fetch('/api/system/export', {
        method: 'POST',
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'System-Export fehlgeschlagen')
      }

      alert(`System-Export erstellt. Snapshot: ${json?.files?.latestSnapshot || '-'}`)
    } catch (error: any) {
      alert(error?.message || 'System-Export konnte nicht erstellt werden.')
    } finally {
      setExportingSystem(false)
    }
  }

  function markDueReminders() {
    const ids = leads
      .filter((lead) =>
        isLeadOverdue(lead.follow_up_at, lead.closed) ||
        isLeadDueToday(lead.follow_up_at, lead.closed)
      )
      .filter((lead) => lead.closed !== true)
      .filter((lead) => lead.hot_alert_sent !== true)
      .map((lead) => lead.id)

    updateReminderState(ids, true)
  }

  function resetDueReminders() {
    const ids = leads
      .filter((lead) =>
        isLeadOverdue(lead.follow_up_at, lead.closed) ||
        isLeadDueToday(lead.follow_up_at, lead.closed)
      )
      .filter((lead) => lead.closed !== true)
      .filter((lead) => lead.hot_alert_sent === true)
      .map((lead) => lead.id)

    updateReminderState(ids, false)
  }

  function handlePlusDays(leadId: string, days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    updateLeadFollowUp(leadId, {
      follow_up_at: date.toISOString(),
    })
  }

  function handleDone(leadId: string) {
    updateLeadFollowUp(leadId, {
      closed: true,
    })
  }

  function bulkPlusOneDayForToday() {
    const ids = leads
      .filter((lead) => isLeadDueToday(lead.follow_up_at, lead.closed))
      .map((lead) => lead.id)

    const date = new Date()
    date.setDate(date.getDate() + 1)

    bulkUpdateLeads(ids, {
      follow_up_at: date.toISOString(),
    })
  }

  function bulkMoveOverdueToProcessing() {
    const ids = leads
      .filter((lead) => isLeadOverdue(lead.follow_up_at, lead.closed))
      .map((lead) => lead.id)

    bulkUpdateLeads(ids, {
      status: 'processing',
    })
  }

  function bulkHotToNotified() {
    const ids = leads
      .filter((lead) => (lead.lead_type || '').toLowerCase() === 'hot')
      .map((lead) => lead.id)

    bulkUpdateLeads(ids, {
      status: 'notified',
    })
  }

  function bulkCloseFiltered() {
    const ids = filteredLeads.map((lead) => lead.id)

    bulkUpdateLeads(ids, {
      closed: true,
      status: 'closed',
    })
  }

  const totalLeads = leads.length
  const hotLeads = leads.filter((l) => l.lead_type === 'hot').length
  const newHotLeads = leads.filter(
    (l) => (l.lead_type || '').toLowerCase() === 'hot' && l.hot_alert_sent !== true && l.closed !== true
  ).length
  const openLeads = leads.filter((l) =>
    ['new', 'processing', 'notified', 'missing_email'].includes(l.status || '')
  ).length
  const overdueCount = leads.filter((l) => isLeadOverdue(l.follow_up_at, l.closed)).length
  const todayCount = leads.filter((l) => isLeadDueToday(l.follow_up_at, l.closed)).length
  const urgentCount = leads.filter(
    (l) => isLeadOverdue(l.follow_up_at, l.closed) || isLeadDueToday(l.follow_up_at, l.closed)
  ).length
  const reminderOpenCount = leads.filter(
    (l) =>
      (isLeadOverdue(l.follow_up_at, l.closed) || isLeadDueToday(l.follow_up_at, l.closed)) &&
      l.closed !== true &&
      l.hot_alert_sent !== true
  ).length

  return (
    <div style={{ padding: 20, background: '#111', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: 20 }}>📊 Postmeister Kanban Dashboard</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={kpiCard}>
          <div style={kpiLabel}>Gesamt</div>
          <div style={kpiValue}>{totalLeads}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Offen</div>
          <div style={kpiValue}>{openLeads}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Hot Leads</div>
          <div style={kpiValue}>🔥 {hotLeads}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Neue HOT</div>
          <div style={kpiValue}>{newHotLeads}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Überfällig</div>
          <div style={kpiValue}>{overdueCount}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Heute fällig</div>
          <div style={kpiValue}>{todayCount}</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiLabel}>Reminder offen</div>
          <div style={kpiValue}>{reminderOpenCount}</div>
        </div>
      </div>

      <div style={autoBar}>
        <button type="button" onClick={runAutoScoring} style={autoBtn}>
          Auto-Scoring ausführen
        </button>

        <button
          type="button"
          onClick={() => runHotLeadAlert('notified')}
          style={hotBtn}
        >
          Neue HOT → Notified
        </button>

        <button
          type="button"
          onClick={() => runHotLeadAlert('processing')}
          style={hotBtnSecondary}
        >
          Neue HOT → Processing
        </button>

        {autoScoring ? (
          <span style={{ color: '#60a5fa', fontSize: 12, alignSelf: 'center' }}>
            Leads werden neu bewertet...
          </span>
        ) : null}

        {hotSaving ? (
          <span style={{ color: '#fca5a5', fontSize: 12, alignSelf: 'center' }}>
            Hot-Lead-Aktion läuft...
          </span>
        ) : null}
      </div>

      <div style={reminderBar}>
        <button type="button" onClick={markDueReminders} style={reminderBtn}>
          Fällige Reminder markieren
        </button>

        <button type="button" onClick={resetDueReminders} style={reminderBtnSecondary}>
          Fällige Reminder zurücksetzen
        </button>

        <button type="button" onClick={sendTelegramReminder} style={telegramBtn}>
          Telegram-Reminder senden
        </button>

        <button type="button" onClick={forceDailyTelegramCron} style={telegramBtnSecondary}>
          Daily Cron jetzt erzwingen
        </button>

        <button type="button" onClick={exportSystemArtifacts} style={exportBtn}>
          System-Export schreiben
        </button>

        <button type="button" onClick={exportCsv} style={csvBtn}>
          Leads als CSV exportieren
        </button>

        <button type="button" onClick={exportXlsx} style={xlsxBtn}>
          Leads als XLSX exportieren
        </button>

        <button type="button" onClick={exportPdfReport} style={pdfBtn}>
          PDF-Management-Report
        </button>

        <button type="button" onClick={exportXlsx} style={xlsxBtn}>
          Leads als XLSX exportieren
        </button>

        <button type="button" onClick={exportPdfReport} style={pdfBtn}>
          PDF-Management-Report
        </button>

        {reminderSaving ? (
          <span style={{ color: '#fdba74', fontSize: 12, alignSelf: 'center' }}>
            Reminder-Aktion läuft...
          </span>
        ) : null}

        {telegramSending ? (
          <span style={{ color: '#93c5fd', fontSize: 12, alignSelf: 'center' }}>
            Telegram-Digest wird gesendet...
          </span>
        ) : null}

        {exportingSystem ? (
          <span style={{ color: '#c4b5fd', fontSize: 12, alignSelf: 'center' }}>
            System-Export wird geschrieben...
          </span>
        ) : null}

        {csvExporting ? (
          <span style={{ color: '#86efac', fontSize: 12, alignSelf: 'center' }}>
            CSV-Export wird erstellt...
          </span>
        ) : null}

        {xlsxExporting ? (
          <span style={{ color: '#f9a8d4', fontSize: 12, alignSelf: 'center' }}>
            XLSX-Export wird erstellt...
          </span>
        ) : null}

        {pdfExporting ? (
          <span style={{ color: '#fdba74', fontSize: 12, alignSelf: 'center' }}>
            PDF-Report wird erstellt...
          </span>
        ) : null}

        {xlsxExporting ? (
          <span style={{ color: '#f9a8d4', fontSize: 12, alignSelf: 'center' }}>
            XLSX-Export wird erstellt...
          </span>
        ) : null}

        {pdfExporting ? (
          <span style={{ color: '#fdba74', fontSize: 12, alignSelf: 'center' }}>
            PDF-Report wird erstellt...
          </span>
        ) : null}
      </div>

      <div style={filterBar}>
        <FilterButton
          label={`Alle (${totalLeads})`}
          active={filterMode === 'all'}
          onClick={() => setFilterMode('all')}
        />
        <FilterButton
          label={`Dringend (${urgentCount})`}
          active={filterMode === 'urgent'}
          onClick={() => setFilterMode('urgent')}
        />
        <FilterButton
          label={`Überfällig (${overdueCount})`}
          active={filterMode === 'overdue'}
          onClick={() => setFilterMode('overdue')}
        />
        <FilterButton
          label={`Heute (${todayCount})`}
          active={filterMode === 'today'}
          onClick={() => setFilterMode('today')}
        />
        <FilterButton
          label={`HOT (${hotLeads})`}
          active={filterMode === 'hot'}
          onClick={() => setFilterMode('hot')}
        />
        <FilterButton
          label={`Offen (${openLeads})`}
          active={filterMode === 'open'}
          onClick={() => setFilterMode('open')}
        />
      </div>

      <div style={bulkBar}>
        <button type="button" onClick={bulkPlusOneDayForToday} style={bulkBtn}>
          Heute fällige +1 Tag
        </button>

        <button type="button" onClick={bulkMoveOverdueToProcessing} style={bulkBtn}>
          Überfällige → Processing
        </button>

        <button type="button" onClick={bulkHotToNotified} style={bulkBtn}>
          HOT → Notified
        </button>

        <button type="button" onClick={bulkCloseFiltered} style={bulkBtnDanger}>
          Gefilterte schließen
        </button>

        {bulkSaving ? (
          <span style={{ color: '#60a5fa', fontSize: 12, alignSelf: 'center' }}>
            Bulk-Aktion wird gespeichert...
          </span>
        ) : null}
      </div>

      <p style={{ color: '#aaa', marginBottom: 18 }}>
        Aktiver Filter: <strong style={{ color: '#fff' }}>{filterLabel(filterMode)}</strong>
      </p>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={board}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.key}
              id={column.key}
              title={column.title}
              count={grouped[column.key]?.length ?? 0}
            >
              {grouped[column.key]?.length ? (
                grouped[column.key].map((lead) => (
                  <DraggableLeadCard
                    key={lead.id}
                    lead={lead}
                    saving={savingId === lead.id}
                    onPlus1={() => handlePlusDays(lead.id, 1)}
                    onPlus3={() => handlePlusDays(lead.id, 3)}
                    onDone={() => handleDone(lead.id)}
                  />
                ))
              ) : (
                <div style={emptyCard}>Keine Leads</div>
              )}
            </KanbanColumn>
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...filterBtn,
        ...(active ? filterBtnActive : {}),
      }}
    >
      {label}
    </button>
  )
}

function filterLabel(mode: FilterMode) {
  if (mode === 'urgent') return 'Dringend'
  if (mode === 'overdue') return 'Überfällig'
  if (mode === 'today') return 'Heute fällig'
  if (mode === 'hot') return 'Hot Leads'
  if (mode === 'open') return 'Offene Leads'
  return 'Alle Leads'
}

function KanbanColumn({
  id,
  title,
  count,
  children,
}: {
  id: string
  title: string
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        ...columnStyle,
        border: isOver ? '1px solid #3b82f6' : '1px solid #2a2a2a',
        background: isOver ? '#162033' : '#151515',
      }}
    >
      <div style={columnHeader}>
        <span>{title}</span>
        <span style={countBadge}>{count}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function DraggableLeadCard({
  lead,
  saving,
  onPlus1,
  onPlus3,
  onDone,
}: {
  lead: Lead
  saving: boolean
  onPlus1: () => void
  onPlus3: () => void
  onDone: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const overdue = isLeadOverdue(lead.follow_up_at, lead.closed)
  const dueToday = isLeadDueToday(lead.follow_up_at, lead.closed)
  const priorityBarClass = getLeadPriorityBarClass(lead.priority)

  const style = {
    ...card,
    ...priorityClassToStyle(priorityBarClass),
    ...(overdue ? overdueStyle : dueToday ? dueTodayStyle : {}),
    opacity: isDragging ? 0.55 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <strong>{lead.name || '-'}</strong>
        <span style={badge(lead.lead_type)}>
          {lead.lead_type === 'hot'
            ? '🔥 HOT'
            : lead.lead_type === 'warm'
            ? 'Warm'
            : lead.lead_type === 'cold'
            ? 'Cold'
            : '-'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={priorityBadge(lead.priority)}>
          Priorität: {lead.priority || 'none'}
        </span>

        {lead.hot_alert_sent ? (
          <span style={alertDoneBadge}>Markiert</span>
        ) : (overdue || dueToday) ? (
          <span style={alertNewBadge}>Reminder offen</span>
        ) : (lead.lead_type || '').toLowerCase() === 'hot' ? (
          <span style={alertNewBadge}>Neuer HOT</span>
        ) : null}

        {overdue ? (
          <span style={warningBadgeRed}>
            Überfällig: {formatLeadDate(lead.follow_up_at)}
          </span>
        ) : dueToday ? (
          <span style={warningBadgeOrange}>
            Heute fällig: {formatLeadDate(lead.follow_up_at)}
          </span>
        ) : lead.follow_up_at ? (
          <span style={warningBadgeNeutral}>
            Follow-up: {formatLeadDate(lead.follow_up_at)}
          </span>
        ) : null}
      </div>

      <div style={metaRow}>
        <span>Paket:</span>
        <span>{lead.requested_package || '-'}</span>
      </div>

      <div style={metaRow}>
        <span>Score:</span>
        <span>{lead.lead_score ?? '-'}</span>
      </div>

      <div style={metaRow}>
        <span>E-Mail:</span>
        <span style={{ wordBreak: 'break-word', textAlign: 'right' }}>
          {lead.email || '-'}
        </span>
      </div>

      <div style={metaRow}>
        <span>Reminder:</span>
        <span>{lead.hot_alert_sent ? 'markiert' : '-'}</span>
      </div>

      <div style={metaRow}>
        <span>Follow-up:</span>
        <span>{lead.follow_up_at ? formatLeadDate(lead.follow_up_at) : '-'}</span>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: '#bbb', whiteSpace: 'pre-wrap' }}>
        {lead.message || '-'}
      </div>

      {lead.internal_note ? (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: '#1a1a1a',
            border: '1px solid #333',
            fontSize: 12,
            color: '#ddd',
            whiteSpace: 'pre-wrap',
          }}
        >
          📝 {lead.internal_note}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPlus1()
          }}
          style={actionBtn}
        >
          +1 Tag
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPlus3()
          }}
          style={actionBtn}
        >
          +3 Tage
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDone()
          }}
          style={actionBtnDone}
        >
          ✔ erledigt
        </button>
      </div>

      {saving ? (
        <div style={{ marginTop: 10, fontSize: 12, color: '#60a5fa' }}>
          Speichere Status...
        </div>
      ) : null}
    </div>
  )
}

function priorityClassToStyle(priorityClass: string): React.CSSProperties {
  if (priorityClass.includes('border-red-500')) return { borderLeft: '4px solid #ef4444' }
  if (priorityClass.includes('border-yellow-500')) return { borderLeft: '4px solid #eab308' }
  if (priorityClass.includes('border-gray-400')) return { borderLeft: '4px solid #9ca3af' }
  return { borderLeft: '4px solid #475569' }
}

function badge(type: string | null): React.CSSProperties {
  if (type === 'hot') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(239,68,68,0.14)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.28)',
      fontWeight: 700,
    }
  }
  if (type === 'warm') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(234,179,8,0.12)',
      color: '#fde68a',
      border: '1px solid rgba(234,179,8,0.22)',
      fontWeight: 700,
    }
  }
  if (type === 'cold') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(148,163,184,0.12)',
      color: '#cbd5e1',
      border: '1px solid rgba(148,163,184,0.22)',
      fontWeight: 700,
    }
  }
  return {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#202020',
    color: '#bbb',
    border: '1px solid #333',
  }
}

function priorityBadge(priority?: string | null): React.CSSProperties {
  const value = (priority || '').toLowerCase()
  if (value === 'high') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(239,68,68,0.14)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.28)',
      fontWeight: 700,
    }
  }
  if (value === 'medium' || value === 'normal') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(234,179,8,0.12)',
      color: '#fde68a',
      border: '1px solid rgba(234,179,8,0.22)',
      fontWeight: 700,
    }
  }
  if (value === 'low') {
    return {
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(148,163,184,0.12)',
      color: '#cbd5e1',
      border: '1px solid rgba(148,163,184,0.22)',
      fontWeight: 700,
    }
  }
  return {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#202020',
    color: '#bbb',
    border: '1px solid #333',
  }
}

const board: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  alignItems: 'start',
}
const columnStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: 14,
  minHeight: 320,
}
const columnHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 14,
  fontWeight: 700,
  fontSize: 15,
}
const countBadge: React.CSSProperties = {
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#222',
  color: '#fff',
  border: '1px solid #333',
  fontSize: 12,
  padding: '0 8px',
}
const card: React.CSSProperties = {
  background: '#0f0f0f',
  border: '1px solid #262626',
  borderRadius: 12,
  padding: 14,
  boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
}
const emptyCard: React.CSSProperties = {
  background: '#101010',
  border: '1px dashed #333',
  borderRadius: 12,
  padding: 16,
  color: '#888',
  textAlign: 'center',
}
const metaRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 10,
  fontSize: 13,
  color: '#d4d4d4',
}
const kpiCard: React.CSSProperties = {
  background: '#181818',
  border: '1px solid #2a2a2a',
  borderRadius: 12,
  padding: '14px 16px',
  minWidth: 140,
}
const kpiLabel: React.CSSProperties = {
  fontSize: 12,
  color: '#999',
  marginBottom: 6,
}
const kpiValue: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#fff',
}
const overdueStyle: React.CSSProperties = {
  boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
}
const dueTodayStyle: React.CSSProperties = {
  boxShadow: '0 0 0 2px rgba(249,115,22,0.25)',
}
const warningBadgeRed: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'rgba(239,68,68,0.14)',
  color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.28)',
  fontWeight: 700,
}
const warningBadgeOrange: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'rgba(249,115,22,0.14)',
  color: '#fdba74',
  border: '1px solid rgba(249,115,22,0.28)',
  fontWeight: 700,
}
const warningBadgeNeutral: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#202020',
  color: '#bbb',
  border: '1px solid #333',
}
const alertNewBadge: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'rgba(127,29,29,0.5)',
  color: '#fecaca',
  border: '1px solid rgba(239,68,68,0.35)',
  fontWeight: 700,
}
const alertDoneBadge: React.CSSProperties = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'rgba(6,95,70,0.4)',
  color: '#a7f3d0',
  border: '1px solid rgba(16,185,129,0.35)',
  fontWeight: 700,
}
const actionBtn: React.CSSProperties = {
  fontSize: 11,
  padding: '6px 10px',
  borderRadius: 8,
  background: '#1f2937',
  color: '#fff',
  border: '1px solid #374151',
  cursor: 'pointer',
}
const actionBtnDone: React.CSSProperties = {
  ...actionBtn,
  background: '#065f46',
  border: '1px solid #10b981',
}
const filterBar: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 14,
}
const filterBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 999,
  background: '#1a1a1a',
  color: '#d4d4d4',
  border: '1px solid #333',
  cursor: 'pointer',
}
const filterBtnActive: React.CSSProperties = {
  background: '#2563eb',
  color: '#fff',
  border: '1px solid #3b82f6',
}
const bulkBar: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 14,
}
const bulkBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#1f2937',
  color: '#fff',
  border: '1px solid #374151',
  cursor: 'pointer',
}
const bulkBtnDanger: React.CSSProperties = {
  ...bulkBtn,
  background: '#7f1d1d',
  border: '1px solid #b91c1c',
}
const autoBar: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 14,
}
const autoBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#312e81',
  color: '#fff',
  border: '1px solid #4f46e5',
  cursor: 'pointer',
}
const hotBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#7f1d1d',
  color: '#fff',
  border: '1px solid #ef4444',
  cursor: 'pointer',
}
const hotBtnSecondary: React.CSSProperties = {
  ...hotBtn,
  background: '#3f1d7a',
  border: '1px solid #8b5cf6',
}
const reminderBar: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 14,
}
const reminderBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#7c2d12',
  color: '#fff',
  border: '1px solid #f97316',
  cursor: 'pointer',
}
const reminderBtnSecondary: React.CSSProperties = {
  ...reminderBtn,
  background: '#374151',
  border: '1px solid #6b7280',
}
const telegramBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#0f4c81',
  color: '#fff',
  border: '1px solid #38bdf8',
  cursor: 'pointer',
}

const telegramBtnSecondary: React.CSSProperties = {
  ...telegramBtn,
  background: '#1e3a8a',
  border: '1px solid #60a5fa',
}

const exportBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#4c1d95',
  color: '#fff',
  border: '1px solid #a78bfa',
  cursor: 'pointer',
}

const csvBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#14532d',
  color: '#fff',
  border: '1px solid #22c55e',
  cursor: 'pointer',
}

const xlsxBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#4a044e',
  color: '#fff',
  border: '1px solid #e879f9',
  cursor: 'pointer',
}

const pdfBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#7c2d12',
  color: '#fff',
  border: '1px solid #fb923c',
  cursor: 'pointer',
}


