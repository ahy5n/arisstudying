'use client'

import Link from 'next/link'
import { useState } from 'react'
import { type ColourMap, ModuleChip, typeLabel } from '../bits'
import { BackLink } from '../bits'
import type { ModuleOption } from '@/lib/moduleOptions'
import { ChevronRight } from '../icons'
import type { SessionChoice } from './AddDeck'
import { YourUploads } from './YourUploads'

export interface LibDeck {
  id: string
  title: string
  file: string
  kind: string
  module: string
  outlined: boolean
  slideCount?: number
  status: 'not-uploaded' | 'after-lecture' | null
  topics: { id: string; title: string }[]
}

export interface LibSession {
  key: string
  dayLabel: string
  start: string
  end: string
  type: string
  modules: string[]
  room: string | null
  decks: LibDeck[]
}

export interface LibWeek {
  week: number
  range: string
  sessions: LibSession[]
}

export function KindBadge({ kind }: { kind: string }) {
  const cls =
    kind === 'Lecture'
      ? 'bg-accent-soft text-accent-strong'
      : kind === 'Tutorial'
        ? 'bg-accent-soft text-accent-strong'
        : kind === 'Practice questions'
          ? 'bg-good-soft text-good-ink'
          : 'bg-warn-soft text-warn-ink'
  return <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${cls}`}>{kind}</span>
}

export function DeckStatus({ d }: { d: Pick<LibDeck, 'outlined' | 'slideCount' | 'status'> }) {
  if (d.outlined) return <span className="text-[13px] font-semibold text-good-ink">Outlined{d.slideCount ? ` · ${d.slideCount} slides` : ''}</span>
  if (d.status === 'after-lecture') return <span className="text-[13px] text-muted">Slides released after the lecture</span>
  return <span className="text-[13px] text-muted">Not uploaded yet — open it on Blackboard</span>
}

export function SlidesLibrary({
  weeks,
  colours,
  total,
  outlinedCount,
  uploadModules,
  sessions,
}: {
  weeks: LibWeek[]
  colours: ColourMap
  total: number
  outlinedCount: number
  uploadModules: ModuleOption[]
  sessions: SessionChoice[]
}) {
  const modules = [...new Set(weeks.flatMap((w) => w.sessions.flatMap((s) => s.decks.map((d) => d.module))))].sort()
  const [mod, setMod] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-[920px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Slides & materials</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Every lecture deck, handout and worksheet, by week and session. Outlined decks have a slide-by-slide summary here; the files themselves stay on
        Blackboard.
      </p>
      <p className="mt-2 text-[14px] font-medium text-muted">
        {total} items · {outlinedCount} outlined
      </p>

      <YourUploads modules={uploadModules} sessions={sessions} colours={colours} />

      <h2 className="mt-10 text-[22px] font-semibold">Lecture library</h2>

      <div role="group" aria-label="Filter by module" className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {[null, ...modules].map((m) => {
          const on = mod === m
          return (
            <button
              key={m ?? 'all'}
              onClick={() => setMod(m)}
              aria-pressed={on}
              className={`min-h-11 shrink-0 rounded-full px-4 text-[15px] font-semibold transition-colors ${on ? 'bg-accent text-on-accent' : 'bg-surface text-muted shadow-[var(--shadow-soft)] hover:text-ink'}`}
            >
              {m ?? 'All'}
            </button>
          )
        })}
      </div>

      {weeks.map((w) => {
        const sessions = w.sessions.map((s) => ({ ...s, decks: s.decks.filter((d) => !mod || d.module === mod) })).filter((s) => s.decks.length)
        if (!sessions.length) return null
        return (
          <section key={w.week} className="mt-8" aria-labelledby={`wk-${w.week}`}>
            <h2 id={`wk-${w.week}`} className="text-[22px] font-semibold">
              Week {w.week} <span className="text-muted">· {w.range}</span>
            </h2>
            <div className="mt-3 space-y-4">
              {sessions.map((s) => (
                <div key={s.key} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/70 bg-bg/40 px-5 py-3">
                    <span className="text-[14px] font-semibold text-ink">{s.dayLabel}</span>
                    <span className="text-[14px] tabular-nums text-muted">
                      {s.start}–{s.end}
                    </span>
                    <span className="text-[14px] font-medium">{typeLabel(s.type)}</span>
                    {s.modules.map((c) => (
                      <ModuleChip key={c} code={c} colours={colours} />
                    ))}
                    {s.room && <span className="text-[13px] text-muted">{s.room}</span>}
                  </div>
                  <ul className="divide-y divide-border/70">
                    {s.decks.map((d) => (
                      <li key={d.id}>
                        <Link href={`/slides/${d.id}`} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-bg/50">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <KindBadge kind={d.kind} />
                              <span className="font-medium leading-snug">{d.title}</span>
                            </div>
                            <p className="mt-0.5 break-all text-[12px] text-muted">{d.file}</p>
                            <div className="mt-1">
                              <DeckStatus d={d} />
                            </div>
                          </div>
                          <ChevronRight className="mt-1 size-5 shrink-0 text-muted group-hover:text-ink" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )
      })}
      <p className="mt-10 text-[13px] text-muted">
        More files can be added at any time — each one is mapped to its session, outlined slide by slide, and cross-checked against the topic pages.
      </p>
    </div>
  )
}
