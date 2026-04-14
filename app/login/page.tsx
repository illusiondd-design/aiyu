'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Login fehlgeschlagen.')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#09101d_35%,#0b1220_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-10">
            <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              AIYU · Login
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Zugriff auf Dashboard und Funktionen.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Melde dich mit deinem Benutzerkonto an. Dein Paket wird aus der
              Datenbank geladen und steuert automatisch die verfügbaren
              Funktionen im Dashboard.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InfoCard
                title="GO"
                text="Basis-Zugriff auf Studio und einfache Erstellung."
              />
              <InfoCard
                title="PRO"
                text="Studio plus operative Pipeline-Steuerung."
              />
              <InfoCard
                title="ULTRA"
                text="Erweiterte Steuerung, Bulk und Publishing."
              />
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur md:p-10">
            <h2 className="text-2xl font-semibold text-white">Anmelden</h2>
            <p className="mt-2 text-sm text-slate-400">
              E-Mail und Passwort eingeben. Das Paket wird automatisch aus deinem
              Konto übernommen.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  placeholder="E-Mail eingeben"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  placeholder="Passwort eingeben"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Anmeldung läuft ...' : 'Login'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}
