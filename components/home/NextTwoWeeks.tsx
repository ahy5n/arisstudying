'use client'

import Link from 'next/link'
import { addDays, fmtDay, fmtDayLong, fmtRange, fmtShort, mondayOf, weekdayIndex } from '@/lib/dates'
import type { MaterialLink } from '@/lib/slides'
import type { Session, WeekInfo } from '@/lib/types'
import { useApp } from '../AppProvider'
import { type ColourMap, ModuleChip, splitModules, typeLabel } from '../bits'
import { LeafIcon } from '../icons'

export interface WeekBlock {
  label: string
  monday: string
  info: WeekInfo | undefined
  days: { date: string; sessions: Session[] }[]
}

/** This week and next. At the weekend, "this week" is the one coming up. */
export function buildWeeks(today: string, weeks: WeekInfo[], sessions: Session[]): WeekBlock[] {
  const weekend = weekdayIndex(today) >= 5
  const first = weekend ? addDays(mondayOf(today), 7) : mondayOf(today)
  const labels = weekend ? ['Next week', 'The week after'] : ['This week', 'Next week']
  return [first, addDays(first, 7)].map((monday, i) => {
    const sunday = addDays(monday, 6)
    const inWeek = sessions
      .filter((s) => s.date >= monday && s.date <= sunday && s.date >= today)
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    const byDay = new Map<string, Session[]>()
    for (const s of inWeek) byDay.set(s.date, [...(byDay.get(s.date) ?? []), s])
    return {
      label: labels[i],
      monday,
      info: weeks.find((w) => w.monday === monday),
      days: [...byDay].map(([date, list]) => ({ date, sessions: list })),
    }
  })
}

export function NextTwoWeeks({
  weeks,
  sessions,
  colours,
  materials,
}: {
  weeks: WeekInfo[]
  sessions: Session[]
  colours: ColourMap
  materials?: Record<string, MaterialLink[]>
}) {
  const { today } = useApp()
  const blocks = buildWeeks(today, weeks, sessions)
  const lastMonday = weeks[weeks.length - 1]?.monday
  const termOver = !!lastMonday && blocks[0].monday > lastMonday

  return (
    <section aria-labelledby="two-weeks">
      <h2 id="two-weeks" className="text-[22px] font-semibold">
        Next two weeks
      </h2>
      {termOver ? (
        <div className="card mt-3 p-6 text-muted">
          That’s the end of the Term 1 timetable. The module library is still here whenever you want it.
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {blocks.map((b) => (
            <WeekCard key={b.monday} block={b} today={today} colours={colours} materials={materials} />
          ))}
        </div>
      )}
    </section>
  )
}

function WeekCard({
  block,
  today,
  colours,
  materials,
}: {
  block: WeekBlock
  today: string
  colours: ColourMap
  materials?: Record<string, MaterialLink[]>
}) {
  const { info } = block
  const title = info ? `Week ${info.week} · ${fmtRange(block.monday, addDays(block.monday, 4))}` : fmtRange(block.monday, addDays(block.monday, 4))

  if (info?.readingWeek) {
    return (
      <div className="card overflow-hidden">
        <WeekHeader label={block.label} title={title} />
        <div className="flex items-center gap-3 bg-sage-soft px-5 py-5 sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage text-sage-ink">
            <LeafIcon />
          </span>
          <div>
            <p className="font-rounded text-[19px] font-semibold text-sage-ink">Reading week 🌿</p>
            <p className="text-[15px] text-muted">No timetabled sessions. The module library is all yours.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <WeekHeader label={block.label} title={title} />
      {block.days.length === 0 ? (
        <p className="px-5 pb-5 text-[15px] text-muted sm:px-6">Nothing timetabled.</p>
      ) : (
        <ol className="divide-y divide-line/80">
          {block.days.map((d) => (
            <li key={d.date} className="px-5 py-3 sm:px-6">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-muted">
                {fmtDayLong(d.date)}
                {d.date === today && (
                  <span className="rounded-full bg-rose-soft px-2 py-0.5 text-[12px] text-rose-ink">Today</span>
                )}
              </p>
              <ul className="mt-1">
                {d.sessions.map((s, i) => (
                  <SessionRow key={i} s={s} colours={colours} materials={materials} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function WeekHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-5 pb-2 pt-4 sm:px-6">
      <p className="font-rounded text-[18px] font-semibold">{title}</p>
      <p className="eyebrow shrink-0">{label}</p>
    </div>
  )
}

export function SessionMaterials({ items }: { items?: MaterialLink[] }) {
  if (!items?.length) return null
  return (
    <div className="-mt-1 mb-1 flex flex-wrap gap-1.5 pl-[88px] sm:pl-[108px]">
      {items.map((m) => (
        <Link
          key={m.id}
          href={`/slides/${m.id}`}
          className="inline-flex min-h-8 items-start gap-1 rounded-xl bg-wash px-2.5 py-1.5 text-left text-[12px] font-semibold leading-snug text-muted hover:bg-rose-soft hover:text-rose-ink"
        >
          <span aria-hidden>📎</span>
          {m.title}
        </Link>
      ))}
    </div>
  )
}

export function SessionRow({
  s,
  colours,
  showDate = false,
  materials,
}: {
  s: Session
  colours: ColourMap
  showDate?: boolean
  materials?: Record<string, MaterialLink[]>
}) {
  const mats = materials?.[`${s.date}T${s.start}`]
  if (s.type === 'Independent Study') {
    return (
      <li className="py-1.5 text-[14px] text-faint">
        {showDate && <span className="mr-2">{fmtDayLong(s.date)} ·</span>}
        Independent study · {s.start}–{s.end}
      </li>
    )
  }
  const codes = splitModules(s.module)
  const target = codes.find((c) => colours[c])
  const body = (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5 py-2 sm:grid-cols-[96px_minmax(0,1fr)]">
      <span className="pt-0.5 text-[15px] tabular-nums text-muted">
        {showDate && (
          <span className="block text-[13px] font-semibold text-ink/80">
            {fmtDay(s.date)} {fmtShort(s.date)}
          </span>
        )}
        {s.start}–{s.end}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[16px] font-medium">{typeLabel(s.type)}</span>
          {codes.map((c) => (
            <ModuleChip key={c} code={c} colours={colours} />
          ))}
          {s.isAssessment && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-lilac-ink">
              <span aria-hidden className="size-2 rounded-full bg-lilac-ink/70" />
              Assessment
            </span>
          )}
        </div>
        <p className="text-[14px] text-muted">
          {s.room}
          {s.needsRotaCheck && <span className="italic"> · check your rota</span>}
        </p>
      </div>
    </div>
  )
  return (
    <li>
      {target ? (
        <Link href={`/m/${target}`} className="-mx-2 block rounded-xl px-2 hover:bg-wash/70 active:bg-wash">
          {body}
        </Link>
      ) : (
        body
      )}
      <SessionMaterials items={mats} />
    </li>
  )
}
