const BASE_URL = 'http://localhost:3000'

async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/api/publish/job/list?limit=10`)
  const json = await res.json()
  return json.data || []
}

async function updateJob(id, payload) {
  await fetch(`${BASE_URL}/api/publish/job/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...payload }),
  })
}

async function processJob(job) {
  console.log(`Processing Job ${job.id}...`)

  // 1. auf processing setzen
  await updateJob(job.id, { status: 'processing' })

  try {
    // SIMULATION (später: echte API → Instagram etc.)
    await new Promise((r) => setTimeout(r, 2000))

    // 2. Erfolg simulieren
    await updateJob(job.id, {
      status: 'published',
      provider: 'manual',
      external_post_id: `sim_${job.id}`,
      published_url: `https://example.com/post/${job.post_id}`,
    })

    console.log(`Job ${job.id} published`)
  } catch (err) {
    await updateJob(job.id, {
      status: 'failed',
      error_message: err.message || 'Runner Error',
    })

    console.log(`Job ${job.id} failed`)
  }
}

async function run() {
  console.log('Runner gestartet...')

  while (true) {
    try {
      const jobs = await fetchJobs()
      const queued = jobs.filter((j) => j.status === 'queued')

      for (const job of queued) {
        await processJob(job)
      }
    } catch (err) {
      console.error('Runner Fehler:', err.message)
    }

    await new Promise((r) => setTimeout(r, 5000))
  }
}

run()
