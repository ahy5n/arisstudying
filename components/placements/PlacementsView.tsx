'use client'

import { useMemo, useState } from 'react'
import { fmtDayLong } from '@/lib/dates'
import type { Placement, PlacementsData } from '@/lib/placements'
import type { PlacementProgress, PlacementStatus } from '@/lib/store'
import { useApp, useData } from '../AppProvider'
import { AskClaudeButton } from '../AskClaudeButton'
import { BackLink } from '../bits'
import { CheckIcon, ChevronDown, CloseIcon, ExternalIcon, PlusIcon } from '../icons'

const STATUSES: { key: PlacementStatus; label: string; pill: string; dot: string }[] = [
  { key: 'not-contacted', label: 'Not contacted', pill: 'bg-wash text-muted', dot: 'bg-faint/50' },
  { key: 'emailed', label: 'Emailed', pill: 'bg-sky-soft text-sky-ink', dot: 'bg-sky-ink' },
  { key: 'interview', label: 'Interview', pill: 'bg-lilac-soft text-lilac-ink', dot: 'bg-lilac-ink' },
  { key: 'confirmed', label: 'Confirmed', pill: 'bg-sage-soft text-sage-ink', dot: 'bg-sage-ink' },
]
const statusMeta = (s: PlacementStatus) => STATUSES.find((x) => x.key === s)!

const EMPTY: PlacementProgress = { status: 'not-contacted', interviewDate: null, interviewTime: null }

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`
const webHref = (w: string) => (/^https?:\/\//.test(w) ? w : `https://${w}`)
const area = (address: string) => {
  const m = address.match(/\b(Birmingham|Solihull|Sutton Coldfield|Edgbaston|Harborne|Moseley|Kings Norton|Knowle|Dorridge|Midlands region)\b/)
  return m ? m[1] : address.split(',')[0]
}

function fmtInterview(p: PlacementProgress) {
  if (!p.interviewDate) return ''
  return `${fmtDayLong(p.interviewDate)}${p.interviewTime ? `, ${p.interviewTime}` : ''}`
}

function emailPrompt(place: Placement) {
  return `Help me write a short, polite email to ${place.name} asking about optometry work experience or shadowing. I'm a 2nd-year MOptom optometry student at Aston University. Here's what they do: ${place.description} Keep it under 150 words, mention when I'm free (ask me first) and what I'd love to observe there.`
}

export function PlacementsView({ data }: { data: PlacementsData }) {
  const app = useData()
  const { today } = useApp()
  const [openId, setOpenId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PlacementStatus | null>(null)
  const [query, setQuery] = useState('')

  const all = useMemo(() => data.categories.flatMap((c) => c.places.map((p) => ({ ...p, category: c.title }))), [data])
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all])
  const progressOf = (id: string) => app.placements?.[id] ?? EMPTY
  const starred = new Map(data.startWith.map((s) => [s.id, s.why]))

  const counts = Object.fromEntries(STATUSES.map((s) => [s.key, 0])) as Record<PlacementStatus, number>
  for (const p of all) counts[progressOf(p.id).status]++

  const interviews = all
    .filter((p) => progressOf(p.id).interviewDate)
    .sort((a, b) => (progressOf(a.id).interviewDate! + (progressOf(a.id).interviewTime ?? '')).localeCompare(progressOf(b.id).interviewDate! + (progressOf(b.id).interviewTime ?? '')))
  const active = all.filter((p) => progressOf(p.id).status !== 'not-contacted')

  const q = query.trim().toLowerCase()
  const matches = (p: Placement) =>
    (!statusFilter || progressOf(p.id).status === statusFilter) &&
    (!q || `${p.name} ${p.address} ${p.description} ${p.org ?? ''}`.toLowerCase().includes(q))

  function open(id: string) {
    setOpenId(id)
    setStatusFilter(null)
    setQuery('')
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })),
    )
  }

  const visibleCount = all.filter(matches).length

  return (
    <div className="mx-auto max-w-[1240px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Placements</h1>
      <p className="mt-1 max-w-2xl text-muted">{data.subtitle}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── List ─────────────────────────────────────── */}
        <div className="min-w-0">
          <Guidance data={data} onOpen={open} byId={byId} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <input
              className="field max-w-sm flex-1"
              type="search"
              placeholder="Search places, e.g. 'myopia' or 'Solihull'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search placements"
            />
            {statusFilter && (
              <button className="btn btn-quiet" onClick={() => setStatusFilter(null)}>
                <CloseIcon className="size-4" />
                Showing: {statusMeta(statusFilter).label}
              </button>
            )}
          </div>
          {visibleCount === 0 && <p className="mt-6 text-muted">Nothing matches that.</p>}

          {data.categories.map((cat, ci) => {
            const places = cat.places.filter(matches)
            if (!places.length) return null
            return (
              <section key={cat.id} className="mt-8" aria-labelledby={`cat-${cat.id}`}>
                <h2 id={`cat-${cat.id}`} className="text-[22px] font-semibold">
                  {ci + 1}. {cat.title}
                </h2>
                <p className="mt-1 text-[15px] text-muted">{cat.intro}</p>
                <ul className="card mt-3 divide-y divide-line/80 overflow-hidden">
                  {places.map((p) => (
                    <PlaceRow
                      key={p.id}
                      place={p}
                      progress={progressOf(p.id)}
                      starWhy={starred.get(p.id)}
                      open={openId === p.id}
                      onToggle={() => setOpenId((cur) => (cur === p.id ? null : p.id))}
                    />
                  ))}
                </ul>
              </section>
            )
          })}
          <p className="mt-8 text-[13px] text-muted">{data.checkedNote}</p>
        </div>

        {/* ── Tracker ──────────────────────────────────── */}
        <aside className="order-first lg:order-none" aria-labelledby="tracker">
          <div className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-4">
            <div className="card p-5">
              <h2 id="tracker" className="text-[20px] font-semibold">
                Tracker
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {STATUSES.map((s) => {
                  const on = statusFilter === s.key
                  return (
                    <button
                      key={s.key}
                      onClick={() => setStatusFilter(on ? null : s.key)}
                      aria-pressed={on}
                      className={`flex min-h-16 flex-col items-start justify-center rounded-2xl px-3 py-2 text-left transition-shadow ${s.pill} ${on ? 'ring-2 ring-current' : ''}`}
                    >
                      <span className="font-rounded text-[24px] font-semibold leading-none">{counts[s.key]}</span>
                      <span className="mt-1 text-[13px] font-semibold">{s.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[12px] text-muted">Tap a box to show only those places.</p>
            </div>

            <div className="card p-5">
              <h3 className="font-rounded text-[17px] font-semibold">Interviews</h3>
              {interviews.length === 0 ? (
                <p className="mt-1 text-[14px] text-muted">None yet. Add a date from any place in the list.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {interviews.map((p) => {
                    const pr = progressOf(p.id)
                    const past = pr.interviewDate! < today
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => open(p.id)}
                          className={`w-full rounded-xl px-2 py-2 text-left hover:bg-wash ${past ? 'opacity-60' : ''}`}
                        >
                          <span className="block text-[13px] font-semibold text-lilac-ink">
                            {fmtInterview(pr)}
                            {pr.interviewDate === today ? ' · today' : ''}
                          </span>
                          <span className="block text-[15px] font-medium leading-snug">{p.name}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="card p-5">
              <h3 className="font-rounded text-[17px] font-semibold">In progress</h3>
              {active.length === 0 ? (
                <p className="mt-1 text-[14px] text-muted">Open a place and set its status when you get in touch.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {active.map((p) => {
                    const meta = statusMeta(progressOf(p.id).status)
                    return (
                      <li key={p.id}>
                        <button onClick={() => open(p.id)} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-wash">
                          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${meta.dot}`} />
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{p.name}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold ${meta.pill}`}>{meta.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Guidance({ data, onOpen, byId }: { data: PlacementsData; onOpen: (id: string) => void; byId: Map<string, Placement> }) {
  return (
    <div className="space-y-3">
      <div className="card bg-gradient-to-br from-rose-soft via-white to-white p-5">
        <p className="eyebrow">Start with these three</p>
        <ul className="mt-2 space-y-2">
          {data.startWith.map((s) => (
            <li key={s.id}>
              <button onClick={() => onOpen(s.id)} className="w-full rounded-xl px-1 py-1 text-left hover:bg-white/70">
                <span className="font-semibold text-rose-ink">★ {byId.get(s.id)?.name}</span>
                <span className="block text-[15px] text-muted">{s.why}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <details className="card group overflow-hidden">
        <summary className="flex min-h-14 items-center justify-between gap-3 px-5 font-rounded text-[17px] font-semibold">
          How to use this list
          <ChevronDown className="size-5 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <ul className="list-disc space-y-1.5 px-5 pb-5 pl-10 text-[15px]">
          {data.howTo.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </details>
      <details className="card group overflow-hidden">
        <summary className="flex min-h-14 items-center justify-between gap-3 px-5 font-rounded text-[17px] font-semibold">
          Before you send
          <ChevronDown className="size-5 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <ul className="list-disc space-y-1.5 px-5 pb-5 pl-10 text-[15px]">
          {data.beforeYouSend.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function PlaceRow({
  place: p,
  progress,
  starWhy,
  open,
  onToggle,
}: {
  place: Placement
  progress: PlacementProgress
  starWhy?: string
  open: boolean
  onToggle: () => void
}) {
  const meta = statusMeta(progress.status)
  return (
    <li id={`place-${p.id}`} className="scroll-mt-24">
      <button onClick={onToggle} aria-expanded={open} aria-controls={`place-${p.id}-body`} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-wash/50 sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-snug">
            {starWhy && (
              <span className="mr-1 text-rose-ink" aria-label="Recommended first">
                ★
              </span>
            )}
            {p.name}
          </span>
          <span className="block text-[14px] text-muted">
            {area(p.address)}
            {progress.interviewDate ? ` · interview ${fmtInterview(progress)}` : ''}
          </span>
        </span>
        {progress.status !== 'not-contacted' && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${meta.pill}`}>{meta.label}</span>}
        <ChevronDown className={`size-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <PlaceDetail place={p} progress={progress} />}
    </li>
  )
}

function PlaceDetail({ place: p, progress }: { place: Placement; progress: PlacementProgress }) {
  const { setPlacement } = useApp()
  const [showDate, setShowDate] = useState(!!progress.interviewDate)
  const dateVisible = showDate || progress.status === 'interview' || !!progress.interviewDate

  return (
    <div id={`place-${p.id}-body`} className="fade-in border-t border-line/60 bg-wash/30 px-4 pb-5 pt-4 sm:px-5">
      <p className="text-[16px] leading-relaxed">{p.description}</p>
      <p className="mt-2 text-[14px] text-muted">
        {p.address}
        {p.org ? ` — ${p.org}` : ''}
      </p>

      <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Phone</dt>
          <dd className="mt-1 space-y-1">
            {p.phones.map((ph) => (
              <p key={ph.number}>
                <a href={telHref(ph.number)} className="font-semibold text-rose-ink underline-offset-4 hover:underline">
                  {ph.number}
                </a>
                {ph.note && <span className="text-muted"> — {ph.note}</span>}
              </p>
            ))}
            {p.phoneNote && <p className="text-muted">{p.phoneNote}</p>}
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Email</dt>
          <dd className="mt-1 space-y-1">
            {p.emails.map((e) => (
              <p key={e.address} className="break-words">
                <a href={`mailto:${e.address}`} className="font-semibold text-rose-ink underline-offset-4 hover:underline">
                  {e.address}
                </a>
                {e.label && <span className="text-muted"> — {e.label}</span>}
              </p>
            ))}
            {p.emailNote && <p className="text-muted">{p.emailNote}</p>}
          </dd>
        </div>
      </dl>

      {(p.web || p.webNote) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {p.web && (
            <a href={webHref(p.web)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              Visit website
              <ExternalIcon className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          <span className="text-[13px] text-muted">
            {p.web}
            {p.webNote ? `${p.web ? ' · ' : ''}${p.webNote}` : ''}
          </span>
        </div>
      )}

      {p.tip && (
        <p className="mt-4 rounded-2xl bg-butter-soft px-4 py-3 text-[15px] text-butter-ink">
          <b>Tip:</b> {p.tip}
        </p>
      )}

      {/* Tracker controls */}
      <div className="mt-5 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
        <p className="eyebrow">Your status</p>
        <div role="radiogroup" aria-label={`Status for ${p.name}`} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUSES.map((s) => {
            const on = progress.status === s.key
            return (
              <button
                key={s.key}
                role="radio"
                aria-checked={on}
                onClick={() => setPlacement(p.id, { status: s.key })}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-[14px] font-semibold transition-colors ${
                  on ? `${s.pill} ring-2 ring-current` : 'bg-wash/70 text-muted hover:text-ink'
                }`}
              >
                {on && <CheckIcon className="size-4" />}
                {s.label}
              </button>
            )
          })}
        </div>

        {dateVisible ? (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-muted">Interview date</span>
              <input
                type="date"
                className="field w-auto"
                value={progress.interviewDate ?? ''}
                onChange={(e) =>
                  setPlacement(p.id, {
                    interviewDate: e.target.value || null,
                    // Adding a date implies an interview is happening.
                    ...(e.target.value && progress.status !== 'confirmed' ? { status: 'interview' as const } : {}),
                  })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-muted">Time (optional)</span>
              <input
                type="time"
                className="field w-auto"
                value={progress.interviewTime ?? ''}
                onChange={(e) => setPlacement(p.id, { interviewTime: e.target.value || null })}
              />
            </label>
            {progress.interviewDate && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setPlacement(p.id, { interviewDate: null, interviewTime: null })
                  setShowDate(false)
                }}
              >
                Clear date
              </button>
            )}
          </div>
        ) : (
          <button className="btn btn-soft mt-4" onClick={() => setShowDate(true)}>
            <PlusIcon className="size-4" />
            Add interview date
          </button>
        )}
      </div>

      <div className="mt-4">
        <AskClaudeButton text={emailPrompt(p)} label="Help me write the email" variant="small" />
      </div>
    </div>
  )
}
