'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addDays, fmtDay, fmtRange, fmtShort } from '@/lib/dates'
import { backend } from '@/lib/store'
import { summariseWeek, type WeekSession, type WeekSummary as Summary, type WeekTopic } from '@/lib/week'
import { useApp, useData } from '../AppProvider'
import { BackLink, ProgressRing } from '../bits'

/** "Your week": the last 7 days of study, and what's coming up in the next 7. */
export function WeekSummary({ topics, sessions }: { topics: WeekTopic[]; sessions: WeekSession[] }) {
  const { user, today } = useApp()
  const data = useData()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!user) return
    let gone = false
    // Two weeks back, so this week can be compared with the one before.
    const since = new Date(`${addDays(today, -14)}T00:00:00Z`).toISOString()
    backend
      .recentActivity(user, since)
      .then((activity) => {
        if (!gone) setSummary(summariseWeek({ today, activity, topics, reviews: data.reviews, timetable: sessions, assessments: data.assessments }))
      })
      .catch(() => !gone && setFailed(true))
    return () => {
      gone = true
    }
    // Worked out once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, today])

  return (
    <div className="mx-auto max-w-[820px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Your week</h1>
      <p className="mt-1 text-muted">{fmtRange(addDays(today, -6), today)}: what you did, and what’s coming up.</p>

      {failed && <p className="card mt-6 p-5 text-muted">Couldn’t load your week just now. Check your connection and try again.</p>}
      {!summary && !failed && <p className="mt-6 text-muted">Working it out…</p>}
      {summary && <Body s={summary} />}
    </div>
  )
}

function Body({ s }: { s: Summary }) {
  const pct = s.answered ? Math.round((s.right / s.answered) * 100) : 0
  const change = s.answered - s.answeredBefore
  const busiest = Math.max(1, ...s.days.map((d) => d.answers))

  return (
    <div className="mt-6 space-y-6">
      <section className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto">
          <ProgressRing value={s.answered ? s.right / s.answered : 0} size={104} stroke={9} label={`${pct}% right`} />
        </div>
        <div>
          {s.answered === 0 ? (
            <>
              <p className="text-[22px] font-semibold">A quiet week</p>
              <p className="mt-1 text-muted">No questions answered in the last 7 days. Ten minutes on a quick quiz is a good way back in.</p>
              <Link href="/quiz" className="btn btn-primary mt-4">
                Quick quiz
              </Link>
            </>
          ) : (
            <>
              <p className="text-[22px] font-semibold">
                {s.answered} answered · {pct}% right
              </p>
              <p className="mt-1 text-muted">
                {s.answeredBefore === 0
                  ? 'Your first week of answers here. 🌷'
                  : change > 0
                    ? `${change} more than the week before. Lovely consistency.`
                    : change === 0
                      ? 'The same as the week before. Steady wins.'
                      : `${-change} fewer than the week before. A short quiz today gets you back on track.`}
              </p>
            </>
          )}
          <div className="mt-4">
            <p className="text-[13px] font-semibold text-muted">
              You studied on {s.activeDays} of 7 days
            </p>
            <ol className="mt-2 grid grid-cols-7 gap-1.5" aria-label="Answers each day">
              {s.days.map((d) => (
                <li key={d.date} className="flex flex-col items-center gap-1">
                  <span className="flex h-14 w-full items-end overflow-hidden rounded-md bg-bg" aria-hidden>
                    <span className="w-full rounded-md bg-accent" style={{ height: `${d.answers ? Math.max(12, (d.answers / busiest) * 100) : 0}%` }} />
                  </span>
                  <span className="text-[12px] text-muted">{fmtDay(d.date)}</span>
                  <span className="sr-only">{d.answers} answers</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-[18px] font-semibold">Topics ticked off</h2>
          {s.topicsTicked.length === 0 ? (
            <p className="mt-2 text-[15px] text-muted">None this week. Tick Covered or Revised on a topic page as you go.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-[15px]">
              {s.topicsTicked.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <Link href={`/t/${t.id}`} className="font-medium text-ink underline-offset-4 hover:underline">
                    <span className="text-muted">{t.moduleCode} · </span>
                    {t.title}
                  </Link>
                </li>
              ))}
              {s.topicsTicked.length > 8 && <li className="text-muted">and {s.topicsTicked.length - 8} more</li>}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-[18px] font-semibold">Mistakes deck</h2>
          <p className="mt-2 text-[15px] text-muted">
            {s.deckTotal === 0
              ? 'Empty. Anything you get wrong will come back here.'
              : `${s.deckTotal} question${s.deckTotal === 1 ? '' : 's'} in your deck, ${s.deckDue} due today.`}
          </p>
          {s.deckDue > 0 && (
            <Link href="/mistakes" className="btn btn-quiet mt-4">
              Clear today’s {s.deckDue}
            </Link>
          )}
        </section>
      </div>

      {s.weakest && (
        <section className="rounded-[22px] bg-warn-soft p-6 ring-1 ring-warn">
          <h2 className="text-[18px] font-semibold text-warn-ink">Worth a look: {s.weakest.moduleCode}</h2>
          <p className="mt-1 text-[15px]">
            {s.weakest.pct}% right from {s.weakest.answered} answers this week, your lowest. A topic quiz there would help most.
          </p>
          <Link href={`/m/${s.weakest.moduleCode}/quiz`} className="btn btn-quiet mt-4">
            {s.weakest.moduleCode} quizzes
          </Link>
        </section>
      )}

      <section className="card p-6">
        <h2 className="text-[18px] font-semibold">Next 7 days</h2>
        {s.comingUp.length === 0 ? (
          <p className="mt-2 text-[15px] text-muted">
            Nothing timetabled, and no dated assessments in your tracker.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {s.comingUp.map((c, i) => (
              <li key={i} className="flex items-baseline gap-4 py-2.5 text-[15px]">
                <span className={`w-20 shrink-0 font-semibold ${c.kind === 'assessment' ? 'text-warn-ink' : 'text-muted'}`}>{fmtShort(c.date)}</span>
                <span className="min-w-0">
                  {c.label}
                  {c.kind === 'assessment' && <span className="ml-2 rounded-md bg-warn px-1.5 py-0.5 text-[12px] font-semibold text-warn-ink">Assessment</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
