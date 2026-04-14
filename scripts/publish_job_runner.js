const BASE_URL = process.env.POSTMEISTER_BASE_URL || 'http://localhost:3000';
const POLL_INTERVAL_MS = Number(process.env.POSTMEISTER_POLL_INTERVAL_MS || 5000);

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `GET ${path} fehlgeschlagen`);
  }

  return json;
}

async function apiPost(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `POST ${path} fehlgeschlagen`);
  }

  return json;
}

async function loadJobs() {
  const json = await apiGet('/api/publish/job/list?limit=50');
  return Array.isArray(json.data) ? json.data : [];
}

async function updateJob(id, payload) {
  return apiPost('/api/publish/job/update', { id, ...payload });
}

async function writeActivityLog(payload) {
  try {
    await apiPost('/api/activity/log', payload);
  } catch (err) {
    console.error('[runner] Activity-Log Fehler:', err.message);
  }
}

async function processJob(job) {
  console.log(`[runner] Starte Job #${job.id} für Post #${job.post_id} (${job.platform})`);

  await updateJob(job.id, { status: 'processing' });

  await writeActivityLog({
    post_id: job.post_id,
    action: 'publish_job_processing',
    status: 'info',
    message: `Publish-Job #${job.id} wird verarbeitet`,
    platform: job.platform || null,
    meta: { job_id: job.id, source: 'publish_runner' },
  });

  try {
    // Phase 1: Manual/Buffer-Modus
    // Hier wird bewusst nur eine kontrollierte Simulation gemacht.
    // Später kann hier Buffer/Later/Instagram API angebunden werden.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const publishedUrl = `https://example.com/post/${job.post_id}`;

    await updateJob(job.id, {
      status: 'published',
      provider: 'manual',
      external_post_id: `manual_${job.id}`,
      published_url: publishedUrl,
    });

    await writeActivityLog({
      post_id: job.post_id,
      action: 'publish_job_completed',
      status: 'success',
      message: `Publish-Job #${job.id} erfolgreich abgeschlossen`,
      platform: job.platform || null,
      meta: {
        job_id: job.id,
        source: 'publish_runner',
        published_url: publishedUrl,
      },
    });

    console.log(`[runner] Job #${job.id} erfolgreich veröffentlicht`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Runner-Fehler';

    await updateJob(job.id, {
      status: 'failed',
      error_message: message,
    });

    await writeActivityLog({
      post_id: job.post_id,
      action: 'publish_job_failed',
      status: 'error',
      message: `Publish-Job #${job.id} fehlgeschlagen: ${message}`,
      platform: job.platform || null,
      meta: { job_id: job.id, source: 'publish_runner' },
    });

    console.error(`[runner] Job #${job.id} fehlgeschlagen: ${message}`);
  }
}

async function tick() {
  const jobs = await loadJobs();
  const queuedJobs = jobs.filter((job) => (job.status || '').toLowerCase() === 'queued');

  if (queuedJobs.length === 0) {
    console.log('[runner] Keine queued Jobs gefunden');
    return;
  }

  console.log(`[runner] ${queuedJobs.length} queued Job(s) gefunden`);

  for (const job of queuedJobs) {
    await processJob(job);
  }
}

async function run() {
  console.log(`[runner] Publish Runner gestartet | BASE_URL=${BASE_URL} | INTERVAL=${POLL_INTERVAL_MS}ms`);

  while (true) {
    try {
      await tick();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Hauptfehler';
      console.error('[runner] Hauptschleifenfehler:', message);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

run().catch((err) => {
  console.error('[runner] Fataler Fehler:', err);
  process.exit(1);
});
