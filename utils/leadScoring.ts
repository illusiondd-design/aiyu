export type ScorableLead = {
  id?: string
  name?: string | null
  email?: string | null
  requested_package?: string | null
  message?: string | null
  lead_score?: number | null
  lead_type?: string | null
  priority?: string | null
  hot_alert_sent?: boolean | null
  follow_up_at?: string | null
  status?: string | null
  closed?: boolean | null
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((word) => text.includes(word))
}

export function scoreLead(lead: ScorableLead) {
  let score = 0

  const pkg = (lead.requested_package || '').toLowerCase()
  const msg = (lead.message || '').toLowerCase()
  const email = (lead.email || '').toLowerCase()
  const combined = `${pkg} ${msg} ${email}`

  if (lead.email) score += 10
  if (lead.name) score += 5

  if (pkg.includes('pro')) score += 20
  if (pkg.includes('premium')) score += 20
  if (pkg.includes('business')) score += 18
  if (pkg.includes('kmu')) score += 18
  if (pkg.includes('growth')) score += 16
  if (pkg.includes('starter')) score += 8

  if (
    includesAny(combined, [
      'sofort',
      'dringend',
      'schnell',
      'zeitnah',
      'direkt',
      'anrufen',
      'telefon',
      'angebot',
      'termin',
      'beratung',
      'starten',
      'interesse',
      'brauche',
      'budget',
      'kunden',
      'leads',
      'reichweite',
      'automatisierung',
      'crm',
      'social media',
      'social-media',
      'marketing',
    ])
  ) {
    score += 18
  }

  if (
    includesAny(combined, [
      'preis',
      'kosten',
      'abo',
      'paket',
      'monat',
      'service',
      'lösung',
      'umsetzen',
    ])
  ) {
    score += 10
  }

  if (
    includesAny(combined, [
      'nur mal schauen',
      'info',
      'infos',
      'später',
      'irgendwann',
      'vielleicht',
      'test',
    ])
  ) {
    score -= 6
  }

  if (!lead.email) score -= 5

  if (score < 0) score = 0
  if (score > 100) score = 100

  let lead_type: 'hot' | 'warm' | 'cold' = 'cold'
  let priority: 'high' | 'medium' | 'low' = 'low'
  let follow_up_at: string | null = null

  const now = new Date()

  if (score >= 60) {
    lead_type = 'hot'
    priority = 'high'
    follow_up_at = now.toISOString()
  } else if (score >= 30) {
    lead_type = 'warm'
    priority = 'medium'
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    follow_up_at = next.toISOString()
  } else {
    lead_type = 'cold'
    priority = 'low'
    const next = new Date(now)
    next.setDate(next.getDate() + 3)
    follow_up_at = next.toISOString()
  }

  return {
    lead_score: score,
    lead_type,
    priority,
    follow_up_at,
  }
}
