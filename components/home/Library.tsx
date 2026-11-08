'use client'

import Link from 'next/link'
import { useState } from 'react'
import { inkColour, subjectWash } from '@/lib/colour'
import { addDays, fmtDayLong, mondayOf, weekdayIndex } from '@/lib/dates'
import { isDue } from '@/lib/leitner'
import { type LibraryModule, moduleProgress, yearLabel } from '@/lib/progress'
import type { WeekInfo } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { ProgressRing } from '../bits'
import { ChevronRight } from '../icons'

const THEMES = ['Foundations', 'Management', 'Patient', 'Professional'] as const
const YEARS = [1, 2, 3, 4, 5] as const

export function Library({
  modules,
  weeks,
  knownItemIds,
  checklistCount,
}: {
  modules: LibraryModule[]
  weeks: WeekInfo[]
  knownItemIds: string[]
  checklistCount: number
}) {
  const { today } = useApp()
  const data = useData()
  const [theme, setTheme] = useState<string | null>(null)
  const [year, setYear] = useState<number | null>(null)

  const weekend = weekdayIndex(today) >= 5
  const thisMonday = weekend ? addDays(mondayOf(today), 7) : mondayOf(today)
  const readingWeek = !!weeks.find((w) => w.monday === thisMonday)?.readingWeek

  const known = new Set(knownItemIds)
  const due = Object.values(data.reviews).filter((r) => known.has(r.itemId) && isDue(r, today)).length
  const inDeck = Object.values(data.reviews).filter((r) => known.has(r.itemId) && r.box < 5).length
  const shown = modules.filter((m) => (!theme || m.theme === theme) && (!year || m.years.includes(year)))

  return (
    <section
      aria-labelledby="library"
      className={readingWeek ? 'rounded-[28px] bg-good-soft/80 p-3 ring-2 ring-good sm:p-4' : ''}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="library" className="text-[22px] font-semibold">
          Module library
        </h2>
        {readingWeek && <p className="text-[14px] font-medium text-good-ink">Reading week — pick anything you like</p>}
      </div>

      <div role="group" aria-label="Filter by theme" className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {[null, ...THEMES].map((t) => {
          const active = theme === t
          return (
            <button
              key={t ?? 'all'}
              onClick={() => setTheme(t)}
              aria-pressed={active}
              className={`min-h-11 shrink-0 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                active ? 'bg-accent text-on-accent' : 'bg-surface text-muted shadow-[var(--shadow-soft)] hover:text-ink'
              }`}
            >
              {t ?? 'All'}
            </button>
          )
        })}
      </div>

      <div role="group" aria-label="Filter by year" className="no-scrollbar -mx-1 mt-2 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        <span className="shrink-0 text-[13px] font-semibold text-muted">Year</span>
        {[null, ...YEARS].map((y) => {
          const active = year === y
          return (
            <button
              key={y ?? 'any'}
              onClick={() => setYear(y)}
              aria-pressed={active}
              className={`min-h-9 shrink-0 rounded-full px-3.5 text-[14px] font-semibold transition-colors ${
                active ? 'bg-accent text-on-accent' : 'bg-surface text-muted shadow-[var(--shadow-soft)] hover:text-ink'
              }`}
            >
              {y ?? 'Any'}
            </button>
          )
        })}
      </div>
      {shown.length === 0 && <p className="mt-3 text-[14px] text-muted">No modules match those filters.</p>}

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((m) => {
          const pct = moduleProgress(m.rowIds, data.progress)
          const name = data.overrides[m.code] || m.name
          return (
            <li key={m.code}>
              <Link
                href={`/m/${m.code}`}
                className="card group flex h-full min-h-[132px] flex-col justify-between overflow-hidden p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
                style={subjectWash(m.colour, inkColour(m.colour), 160, 33)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="subject-code font-rounded text-[22px] font-bold">
                    {m.code}
                  </span>
                  <ProgressRing value={pct} colour={m.colour} label={`${m.code} ${Math.round(pct * 100)}% ticked`} />
                </div>
                <div>
                  <p className="text-[15px] font-medium leading-snug text-ink">{name}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {yearLabel(m.years)}
                    {!m.hasContent && ' · content coming soon'}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Tile href="/mistakes" title="Mistakes deck" tone="rose">
          {due > 0 ? `${due} to redo today` : inDeck > 0 ? 'Nothing due today' : 'Empty for now'}
        </Tile>
        <Tile href="/quiz" title="Quick quiz" tone="lilac">
          10 questions from across your modules
        </Tile>
        <Tile href="/checklists" title="Checklists" tone="sage">
          {checklistCount} practical {checklistCount === 1 ? 'routine' : 'routines'}
        </Tile>
        <Tile href="/flashcards" title="Your flashcards" tone="lilac" wide>
          {data.cardSets.length
            ? `${data.cardSets.reduce((n, s) => n + s.cards.length, 0)} cards in ${data.cardSets.length} ${data.cardSets.length === 1 ? 'set' : 'sets'}`
            : 'Import from Quizlet, Anki or your slides'}
        </Tile>
        <Tile href="/tracker" title="70% tracker" tone="butter">
          Your marks and what’s left
        </Tile>
        <Tile href="/slides" title="Slides & materials" tone="rose" wide>
          Every lecture deck and worksheet, by week — with slide-by-slide outlines
        </Tile>
        <Tile href="/placements" title="Placements" tone="sky" wide>
          {placementSummary(data.placements ?? {}, today)}
        </Tile>
      </div>
    </section>
  )
}

function placementSummary(
  placements: Record<string, { status: string; interviewDate: string | null }>,
  today: string,
) {
  const list = Object.values(placements)
  const confirmed = list.filter((p) => p.status === 'confirmed').length
  const inProgress = list.filter((p) => p.status === 'emailed' || p.status === 'interview').length
  const next = list
    .map((p) => p.interviewDate)
    .filter((d): d is string => !!d && d >= today)
    .sort()[0]
  const parts: string[] = []
  if (confirmed) parts.push(`${confirmed} confirmed`)
  if (inProgress) parts.push(`${inProgress} in progress`)
  if (next) parts.push(`next interview ${fmtDayLong(next)}`)
  return parts.length ? parts.join(' · ') : 'Work experience contacts in Birmingham & Solihull'
}

const TONES = {
  rose: 'bg-accent-soft text-accent-strong',
  lilac: 'bg-accent-soft text-accent-strong',
  sage: 'bg-accent-soft text-accent-strong',
  butter: 'bg-accent-soft text-accent-strong',
  sky: 'bg-accent-soft text-accent-strong',
}

function Tile({
  href,
  title,
  tone,
  wide = false,
  children,
}: {
  href: string
  title: string
  tone: keyof typeof TONES
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`${wide ? 'sm:col-span-2 ' : ''}card flex min-h-[72px] items-center justify-between gap-3 px-5 py-4 transition-shadow hover:shadow-[var(--shadow-lift)]`}
    >
      <div>
        <p className="font-rounded text-[17px] font-semibold">{title}</p>
        <p className="text-[14px] text-muted">{children}</p>
      </div>
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${TONES[tone]}`}>
        <ChevronRight className="size-[18px]" />
      </span>
    </Link>
  )
}
