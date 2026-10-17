'use client'

import { useState } from 'react'
import { fmtShort } from '@/lib/dates'
import { useApp, useData } from '../AppProvider'
import { FALLBACK_CLAUDE_URL } from '../AskClaudeButton'
import { BackLink } from '../bits'

function isClaudeUrl(v: string) {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && (u.hostname === 'claude.ai' || u.hostname.endsWith('.claude.ai'))
  } catch {
    return false
  }
}

export function Settings() {
  const { setClaudeUrl, toast, mode, signOut, user } = useApp()
  const data = useData()
  const [url, setUrl] = useState(data.profile.claudeProjectUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const v = url.trim()
    if (v && !isClaudeUrl(v)) {
      setError('That doesn’t look like a claude.ai link. It should start with https://claude.ai/project/…')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await setClaudeUrl(v)
      toast('Saved.')
    } catch {
      toast('Couldn’t save just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Settings</h1>

      <section className="card mt-6 p-6" aria-labelledby="claude">
        <h2 id="claude" className="text-[20px] font-semibold">
          Your Claude project link
        </h2>
        <form onSubmit={save} className="mt-3">
          <input
            className="field"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="https://claude.ai/project/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-describedby="claude-help"
          />
          {error && (
            <p role="alert" className="mt-2 text-[14px] text-rose-ink">
              {error}
            </p>
          )}
          <div id="claude-help" className="mt-3 space-y-1.5 text-[15px] text-muted">
            <p>Every “Ask Claude” button copies a question and opens this link, so your tutor chat already knows your course.</p>
            <p>
              To find it: open <b>claude.ai</b>, tap <b>Projects</b>, open your study project, then copy the address from the
              address bar (in Safari, tap the address bar → Copy). It looks like <span className="whitespace-nowrap">claude.ai/project/…</span>
            </p>
            <p>Left empty, the buttons open a new chat at {FALLBACK_CLAUDE_URL.replace('https://', '')}.</p>
          </div>
          <button className="btn btn-primary mt-4" disabled={busy}>
            Save
          </button>
        </form>
      </section>

      <PasswordCard />

      <section className="card mt-6 p-6" aria-labelledby="account">
        <h2 id="account" className="text-[20px] font-semibold">
          Account
        </h2>
        <p className="mt-2 text-[15px] text-muted">
          Signed in as <b className="text-ink">{user?.username}</b>.{' '}
          {mode === 'supabase'
            ? 'Your ticks, notes and marks sync across your devices.'
            : 'This device only — progress is saved in this browser and won’t appear on other devices.'}
        </p>
        <button className="btn btn-quiet mt-4" onClick={() => void signOut()}>
          Sign out
        </button>
      </section>

      {data.flags.length > 0 && (
        <section className="mt-8" aria-labelledby="flags">
          <h2 id="flags" className="text-[20px] font-semibold">
            Things you’ve flagged
          </h2>
          <ul className="mt-3 space-y-2">
            {data.flags.slice(0, 20).map((f, i) => (
              <li key={i} className="card px-4 py-3 text-[15px]">
                <p>{f.message}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {f.topicId}
                  {f.itemId ? ` · ${f.itemId}` : ''} · {fmtShort(f.createdAt.slice(0, 10))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function PasswordCard() {
  const { changePassword, toast } = useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      toast('Password changed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t change it.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card mt-6 p-6" aria-labelledby="pw">
      <h2 id="pw" className="text-[20px] font-semibold">
        Change password
      </h2>
      <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">Current password</span>
          <input className="field" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[14px] font-medium">New password</span>
          <input className="field" type="password" autoComplete="new-password" minLength={6} required value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        {error && (
          <p role="alert" className="text-[14px] text-rose-ink sm:col-span-2">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button className="btn btn-quiet" disabled={busy}>
            Change password
          </button>
        </div>
      </form>
    </section>
  )
}
