'use client'

import { useState } from 'react'
import { useApp } from './AppProvider'

export function LoginScreen() {
  const { signIn, mode } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t sign in.')
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="absolute -left-24 -top-24 size-80 rounded-full bg-rose/60 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -right-16 size-96 rounded-full bg-lilac/70 blur-3xl" />
      <div aria-hidden className="absolute bottom-10 left-1/4 size-56 rounded-full bg-sage/70 blur-3xl" />
      <main className="card relative w-full max-w-sm p-8 sm:p-10">
        <h1 className="text-center font-rounded text-[28px] font-semibold">Hi Ari 🌷</h1>
        <p className="mt-1 text-center text-muted">Sign in to your study space</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-medium">Username</span>
            <input
              className="field"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[15px] font-medium">Password</span>
            <input
              className="field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-rose-soft px-3 py-2 text-[15px] text-rose-ink">
              {error}
            </p>
          )}
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {mode === 'local' && (
          <p className="mt-6 text-center text-[13px] leading-snug text-muted">
            This device only: the first sign-in with a new username sets it up here.
          </p>
        )}
      </main>
    </div>
  )
}
