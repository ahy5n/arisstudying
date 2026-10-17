'use client'

import Link from 'next/link'
import { useState } from 'react'
import { inkColour } from '@/lib/colour'
import type { ModuleView as ModuleData, Session, StaffMember } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { BackLink, type ColourMap, ProgressRing } from '../bits'
import { SessionRow } from '../home/NextTwoWeeks'
import { ChevronDown, ChevronRight, PencilIcon } from '../icons'
import { moduleProgress } from '@/lib/progress'
import { TickButton } from './TickButton'

export function ModuleView({
  module: m,
  leads,
  sessions,
  colours,
  verifyNote,
  questionCount,
}: {
  module: ModuleData
  leads: (StaffMember & { initials: string })[]
  sessions: Session[]
  colours: ColourMap
  verifyNote?: string
  questionCount: number
}) {
  const { today, setProgress, setOverride } = useApp()
  const data = useData()
  const override = data.overrides[m.code]
  const name = override || m.name
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const pct = moduleProgress(
    m.rows.map((r) => r.id),
    data.progress,
  )

  const upcoming = sessions.filter((s) => s.date >= today && s.type !== 'Independent Study')
  const past = sessions.filter((s) => s.date < today && s.type !== 'Independent Study')

  return (
    <div className="mx-auto max-w-[920px]">
      <BackLink href="/">Home</BackLink>

      <header
        className="card mt-2 overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${m.colour} 0%, ${m.colour}66 50%, #fff 100%)` }}
      >
        <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-0">
            <p className="font-rounded text-[17px] font-bold" style={{ color: inkColour(m.colour) }}>
              {m.code} · {m.theme}
            </p>
            {editing ? (
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const v = draft.trim()
                  setOverride(m.code, v || null)
                  setEditing(false)
                }}
              >
                <input
                  className="field max-w-md flex-1 text-[20px] font-semibold"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Module name"
                  autoFocus
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <h1 className="mt-1 text-[30px] font-semibold sm:text-[34px]">{name}</h1>
            )}
            {!editing &&
              (override ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[14px] text-muted">
                  Name confirmed by you.
                  <button className="min-h-11 font-semibold text-ink underline-offset-4 hover:underline" onClick={() => { setDraft(name); setEditing(true) }}>
                    Edit
                  </button>
                  <button className="min-h-11 font-semibold text-ink underline-offset-4 hover:underline" onClick={() => setOverride(m.code, null)}>
                    Reset
                  </button>
                </p>
              ) : (
                <button
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/70 px-3.5 text-[14px] font-medium text-ink hover:bg-white"
                  onClick={() => {
                    setDraft(name)
                    setEditing(true)
                  }}
                >
                  <PencilIcon className="size-4" />
                  Name inferred ({m.confidence} confidence) — tap to correct
                </button>
              ))}
          </div>
          <ProgressRing value={pct} colour={m.colour} size={64} stroke={6} label={`${Math.round(pct * 100)}% ticked`} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/60 bg-white/50 px-6 py-4 text-[15px] sm:px-8">
          {leads.map((l) => (
            <p key={l.initials}>
              <span className="text-muted">Lead · </span>
              <span className="font-medium">{l.name}</span>{' '}
              <a className="text-rose-ink underline-offset-4 hover:underline" href={`mailto:${l.email}`}>
                {l.email}
              </a>
            </p>
          ))}
          {leads.length === 0 && <p className="text-muted">Lead: {m.lead}</p>}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="topics">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="topics" className="text-[22px] font-semibold">
              Topics
            </h2>
            {m.hasContent && questionCount > 0 && (
              <Link href={`/m/${m.code}/quiz`} className="btn btn-soft">
                Module quiz · {questionCount} questions
              </Link>
            )}
          </div>
          {!m.hasContent && (
            <p className="mt-2 rounded-2xl bg-butter-soft px-4 py-3 text-[15px] text-butter-ink">
              Content coming soon. For now this is the topic outline — you can still tick what you’ve covered and revised.
            </p>
          )}
          <ol className="card mt-3 divide-y divide-line/80">
            {m.rows.map((r, i) => {
              const p = data.progress[r.id] ?? { covered: false, revised: false }
              const titleId = `row-${r.id}`
              return (
                <li key={r.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-wash text-[13px] font-semibold text-muted">
                      {i + 1}
                    </span>
                    {r.full ? (
                      <Link id={titleId} href={`/t/${r.id}`} className="group flex min-h-11 flex-1 items-start gap-1 pt-0.5 font-medium hover:text-rose-ink">
                        <span className="flex-1">{r.title}</span>
                        <ChevronRight className="mt-0.5 size-[18px] shrink-0 text-faint group-hover:text-rose-ink" />
                      </Link>
                    ) : (
                      <span id={titleId} className="flex-1 pt-0.5">
                        {r.title}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pl-10 sm:pl-0">
                    <TickButton label="Covered" tone="sage" on={p.covered} describedBy={titleId} onToggle={() => setProgress(r.id, 'covered', !p.covered)} />
                    <TickButton label="Revised" tone="lilac" on={p.revised} describedBy={titleId} onToggle={() => setProgress(r.id, 'revised', !p.revised)} />
                  </div>
                </li>
              )
            })}
          </ol>
          {verifyNote && <p className="mt-3 text-[14px] text-muted">{verifyNote}</p>}
        </section>

        <aside aria-labelledby="sessions">
          <h2 id="sessions" className="text-[22px] font-semibold">
            Sessions
          </h2>
          <div className="card mt-3 px-4 py-2 sm:px-5">
            {upcoming.length === 0 && <p className="py-3 text-[15px] text-muted">No more sessions this term.</p>}
            <ul>
              {upcoming.map((s, i) => (
                <SessionRow key={i} s={s} colours={colours} showDate />
              ))}
            </ul>
            {past.length > 0 && (
              <details className="group border-t border-line/80 py-2">
                <summary className="flex min-h-11 items-center gap-1 text-[15px] font-medium text-muted">
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  Earlier sessions ({past.length})
                </summary>
                <ul className="opacity-80">
                  {past.map((s, i) => (
                    <SessionRow key={i} s={s} colours={colours} showDate />
                  ))}
                </ul>
              </details>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
