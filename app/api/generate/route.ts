import { NextRequest, NextResponse } from 'next/server'

type PackageType = 'go' | 'pro' | 'ultra'
type GenerateMode = 'hashtags' | 'cta' | 'full'

function normalizeGoal(goal: string) {
  const value = (goal || '').toLowerCase()

  if (value.includes('lead')) return 'leads'
  if (value.includes('reich')) return 'reichweite'
  if (value.includes('kund')) return 'kunden'
  return 'wachstum'
}

function getMaxByPackage(pkg: PackageType) {
  if (pkg === 'go') return 3
  if (pkg === 'pro') return 20
  return 50
}

function getPlatformLabel(platform: string) {
  const map: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  }

  return map[platform] || 'Instagram'
}

function getPlatformLimits(platform: string, format: string) {
  const rules: Record<string, { formats: string[]; note: string }> = {
    facebook: {
      formats: ['feed-post', 'video-post', 'story'],
      note: 'Facebook Post theoretisch sehr lang möglich, praktisch meist kurz und klar.',
    },
    instagram: {
      formats: ['post', 'reel', 'story'],
      note: 'Instagram Caption max. 2.200 Zeichen, Hook direkt am Anfang wichtig.',
    },
    linkedin: {
      formats: ['post', 'video-post'],
      note: 'LinkedIn stärker auf Expertise, Story und Klarheit ausrichten.',
    },
    tiktok: {
      formats: ['short-video'],
      note: 'TikTok Caption eher kurz, Hook in den ersten Sekunden entscheidend.',
    },
    youtube: {
      formats: ['short', 'description'],
      note: 'YouTube Shorts: Titel/Hook wichtig, Beschreibung kann länger ausfallen.',
    },
  }

  return (
    rules[platform] || {
      formats: [format || 'post'],
      note: 'Plattformregel nicht definiert.',
    }
  )
}

function buildHook(goal: string, prompt: string, pkg: PackageType, platform: string, format: string, index: number) {
  const hooksByGoal: Record<string, string[]> = {
    wachstum: [
      'So baust du mehr Sichtbarkeit in deinem Markt auf',
      'Warum genau dieses Detail dein Wachstum bremst',
      '3 einfache Hebel für mehr Aufmerksamkeit',
      'Das ist der Unterschied zwischen sichtbar und unsichtbar',
      'Mehr Wirkung mit weniger Aufwand: so geht’s',
    ],
    leads: [
      '3 Fehler, durch die dir Kundenanfragen verloren gehen',
      'So machst du aus Aufmerksamkeit echte Anfragen',
      'Warum gute Inhalte mehr Leads bringen als Werbung allein',
      'Der einfachste Weg zu mehr qualifizierten Anfragen',
      'Dieses Video-Format bringt oft die besten Leads',
    ],
    reichweite: [
      'Warum dieses Format oft deutlich mehr Reichweite bringt',
      'So holst du aus einem Thema 10 starke Clips heraus',
      'Die ersten 3 Sekunden entscheiden alles',
      'Mehr Reichweite beginnt mit einer besseren Hook',
      'So bleibt dein Content endlich hängen',
    ],
    kunden: [
      'Was Vertrauen bei neuen Kunden wirklich auslöst',
      'Dieses Detail überzeugt mehr als jede Werbefloskel',
      'So machst du aus Videos echte Kundengewinner',
      'Warum Kunden auf Klarheit reagieren',
      'Mehr Kunden durch bessere Einblicke statt mehr Gerede',
    ],
  }

  const pool = hooksByGoal[goal] || hooksByGoal.wachstum
  let base = pool[index % pool.length]

  if (platform === 'linkedin') {
    base = `${base} – aus unternehmerischer Sicht`
  } else if (platform === 'tiktok') {
    base = `${base}!`
  } else if (platform === 'youtube') {
    base = `${base} | ${format === 'short' ? 'Short' : 'Beschreibung'}`
  }

  if (pkg === 'go') return base
  if (pkg === 'pro') return `${base} – kompakt erklärt`
  return `${base} – mit Fokus auf Wirkung, Vertrauen und Conversion`
}

function buildCaption({
  goal,
  prompt,
  pkg,
  platform,
  format,
  index,
}: {
  goal: string
  prompt: string
  pkg: PackageType
  platform: string
  format: string
  index: number
}) {
  const promptPart = prompt?.trim()
    ? ` Fokus laut Briefing: ${prompt.trim()}.`
    : ''

  const platformLabel = getPlatformLabel(platform)

  if (platform === 'linkedin') {
    if (pkg === 'go') {
      return `Kurzer ${platformLabel}-Beitrag zu ${goal}.${promptPart}`
    }
    if (pkg === 'pro') {
      return `Dieser ${platformLabel}-Beitrag ist auf ${goal} ausgerichtet.${promptPart} Er verbindet Klarheit, Relevanz und fachliche Wirkung in kompakter Form.`
    }
    return `Dieser ${platformLabel}-Beitrag ist strategisch auf ${goal} optimiert.${promptPart} Er verbindet Expertise, Positionierung, Vertrauen und klare Handlungsführung.`
  }

  if (platform === 'tiktok') {
    if (pkg === 'go') {
      return `Kurzer TikTok-Text zu ${goal}.${promptPart}`
    }
    if (pkg === 'pro') {
      return `Dieser TikTok-Clip ist auf ${goal} ausgerichtet.${promptPart} Schnell, direkt und hook-basiert für bessere Aufmerksamkeit.`
    }
    return `Dieser TikTok-Clip ist auf maximale Aufmerksamkeit und Wirkung ausgerichtet.${promptPart} Starker Einstieg, schnelles Tempo, klare Reaktion.`
  }

  if (platform === 'youtube') {
    return `YouTube-${format} zu ${goal}.${promptPart} Fokus auf Hook, Klarheit und sinnvolle Such-/Themenwirkung.`
  }

  if (pkg === 'go') {
    return `Kurzer ${platformLabel}-Content zu ${goal}.${promptPart} Einfache Struktur, schnell nutzbar.`
  }

  if (pkg === 'pro') {
    return `Dieser ${platformLabel}-Content ist auf ${goal} ausgerichtet.${promptPart} Er verbindet klare Hook, Mehrwert und direkte Handlungsaufforderung.`
  }

  return `Dieser ${platformLabel}-Content ist strategisch auf ${goal} optimiert.${promptPart} Er kombiniert Hook, Nutzenversprechen, Vertrauensaufbau und Conversion-Fokus.`
}

function buildCTA(goal: string, pkg: PackageType, platform: string) {
  if (goal === 'leads') {
    return pkg === 'ultra'
      ? 'Schreib uns jetzt für eine konkrete Einschätzung deines Projekts.'
      : 'Melde dich, wenn du mehr dazu wissen willst.'
  }

  if (goal === 'kunden') {
    return pkg === 'ultra'
      ? 'Sichere dir jetzt ein Gespräch und lass uns dein Vorhaben prüfen.'
      : 'Folge uns für mehr Einblicke und praktische Beispiele.'
  }

  if (platform === 'linkedin') {
    return 'Wie siehst du das in deinem Unternehmen oder Projekt?'
  }

  if (platform === 'youtube') {
    return 'Abonniere den Kanal für weitere praktische Einblicke.'
  }

  if (goal === 'reichweite') {
    return 'Speichere dir den Clip und teile ihn mit jemandem, der das sehen sollte.'
  }

  return 'Folge für mehr Content, der wirklich Wirkung erzeugt.'
}

function buildHashtags(goal: string, pkg: PackageType, platform: string) {
  const base = ['#aiyu', '#content']
  const goalMap: Record<string, string[]> = {
    wachstum: ['#wachstum', '#sichtbarkeit', '#marketing'],
    leads: ['#leads', '#kundengewinnung', '#anfragen'],
    reichweite: ['#reichweite', '#socialmedia', '#aufmerksamkeit'],
    kunden: ['#kunden', '#vertrauen', '#verkauf'],
  }

  const platformMap: Record<string, string[]> = {
    facebook: ['#facebookmarketing'],
    instagram: ['#instagram', '#reels'],
    linkedin: ['#linkedin', '#expertise'],
    tiktok: ['#tiktok', '#viralcontent'],
    youtube: ['#youtube', '#shorts'],
  }

  const extra = goalMap[goal] || goalMap.wachstum
  const platformTags = platformMap[platform] || []

  if (pkg === 'go') return [...base, ...extra, ...platformTags].slice(0, 4)
  if (pkg === 'pro') return [...base, ...extra, ...platformTags, '#videomarketing'].slice(0, 6)
  return [...base, ...extra, ...platformTags, '#videomarketing', '#branding', '#performance'].slice(0, 8)
}

function buildModePayload({
  mode,
  goal,
  prompt,
  pkg,
  platform,
  format,
  index,
}: {
  mode: GenerateMode
  goal: string
  prompt: string
  pkg: PackageType
  platform: string
  format: string
  index: number
}) {
  const hook = buildHook(goal, prompt, pkg, platform, format, index)
  const caption = buildCaption({ goal, prompt, pkg, platform, format, index })
  const cta = buildCTA(goal, pkg, platform)
  const hashtags = buildHashtags(goal, pkg, platform)

  if (mode === 'hashtags') {
    return {
      hook: `Hashtag Set ${index + 1}`,
      caption: hashtags.join(' '),
      cta: '',
      hashtags,
    }
  }

  if (mode === 'cta') {
    return {
      hook: `CTA Variante ${index + 1}`,
      caption: cta,
      cta,
      hashtags: [],
    }
  }

  return {
    hook,
    caption,
    cta,
    hashtags,
  }
}

function buildBatchItems({
  goal,
  count,
  prompt,
  pkg,
  platform,
  format,
  mode,
}: {
  goal: string
  count: number
  prompt: string
  pkg: PackageType
  platform: string
  format: string
  mode: GenerateMode
}) {
  const platformLabel = getPlatformLabel(platform)

  return Array.from({ length: count }).map((_, index) => {
    const number = String(index + 1).padStart(2, '0')
    const status = index === 0 ? 'processing' : index % 5 === 0 ? 'review' : 'ready'
    const payload = buildModePayload({
      mode,
      goal,
      prompt,
      pkg,
      platform,
      format,
      index,
    })

    return {
      id: `short-${index + 1}`,
      title: `${platformLabel} ${format} ${number}`,
      hook: payload.hook,
      status,
      duration: '00:20',
      platform: `${platformLabel} · ${format}`,
      caption: payload.caption,
      cta: payload.cta,
      hashtags: payload.hashtags,
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const pkg = String(body.package || 'go') as PackageType
    const goal = normalizeGoal(String(body.goal || 'wachstum'))
    const prompt = String(body.prompt || '')
    const platform = String(body.platform || 'instagram').toLowerCase()
    const format = String(body.format || 'reel').toLowerCase()
    const mode = String(body.mode || 'full') as GenerateMode
    const rawCount = Number(body.count || 5)

    const max = getMaxByPackage(pkg)
    const count = Math.min(Math.max(rawCount, 1), max)
    const platformInfo = getPlatformLimits(platform, format)

    const items = buildBatchItems({
      goal,
      count,
      prompt,
      pkg,
      platform,
      format,
      mode,
    })

    return NextResponse.json({
      success: true,
      batchId: `batch_${Date.now()}`,
      items,
      meta: {
        package: pkg,
        goal,
        count,
        platform,
        format,
        mode,
        platformNote: platformInfo.note,
      },
    })
  } catch (error) {
    console.error('GENERATE_ERROR', error)
    return NextResponse.json(
      { success: false, error: 'Fehler bei Generierung' },
      { status: 500 }
    )
  }
}
