'use client'

import { useEffect, useState } from 'react'

type UserRow = {
  id: string
  email: string
  package: 'go' | 'pro' | 'ultra'
  created_at?: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pkg, setPkg] = useState<'go' | 'pro' | 'ultra'>('pro')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'User konnten nicht geladen werden.')
      }

      setUsers(json.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, package: pkg }),
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'User konnte nicht erstellt werden.')
      }

      setEmail('')
      setPassword('')
      setPkg('pro')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  async function changePackage(id: string, nextPkg: 'go' | 'pro' | 'ultra') {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: nextPkg }),
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Paket konnte nicht geändert werden.')
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    }
  }

  async function removeUser(id: string) {
    if (!confirm('User wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'User konnte nicht gelöscht werden.')
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#09101d_35%,#0b1220_100%)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Admin · User Management
          </div>
          <h1 className="text-3xl font-semibold">Benutzer verwalten</h1>
          <p className="mt-2 text-sm text-slate-400">
            User anlegen, Pakete ändern und Accounts löschen.
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <h2 className="mb-4 text-xl font-semibold">Neuen User anlegen</h2>

          <form onSubmit={createUser} className="grid gap-4 md:grid-cols-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
            <select
              value={pkg}
              onChange={(e) => setPkg(e.target.value as 'go' | 'pro' | 'ultra')}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
            >
              <option value="go">GO</option>
              <option value="pro">PRO</option>
              <option value="ultra">ULTRA</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-black disabled:opacity-60"
            >
              {saving ? 'Speichert ...' : 'User anlegen'}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Benutzerliste</h2>
            <button
              onClick={loadUsers}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm"
            >
              Neu laden
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-400">Lade User ...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-400">
                    <th className="px-3 py-3">E-Mail</th>
                    <th className="px-3 py-3">Paket</th>
                    <th className="px-3 py-3">Erstellt</th>
                    <th className="px-3 py-3">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="px-3 py-3">{user.email}</td>
                      <td className="px-3 py-3">
                        <select
                          value={user.package}
                          onChange={(e) => changePackage(user.id, e.target.value as 'go' | 'pro' | 'ultra')}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                        >
                          <option value="go">GO</option>
                          <option value="pro">PRO</option>
                          <option value="ultra">ULTRA</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => removeUser(user.id)}
                          className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-red-200"
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                        Keine User vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
