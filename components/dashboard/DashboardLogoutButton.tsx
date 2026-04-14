'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DashboardLogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    try {
      setBusy(true)

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      router.push('/login')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 16,
      }}
    >
      <button
        onClick={handleLogout}
        disabled={busy}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #3a3a3a',
          background: '#111',
          color: '#fff',
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Abmeldung ...' : 'Logout'}
      </button>
    </div>
  )
}
