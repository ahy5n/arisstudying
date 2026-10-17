'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addDays, fmtDayLong } from '@/lib/dates'
import { isDue, RETIRED } from '@/lib/leitner'
import type { PracticeItem } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { BackLink } from '../bits'
import { PracticeRunner } from './PracticeRunner'
import { shuffle } from './shuffle'

const BOX_LABEL = ['', 'back tomorrow', 'every 3 days', 'every week', 'every 2 weeks']

export function MistakesDeck({ items }: { items: PracticeItem[] }) {
  const { today } = useApp()
  const data = useData()
  // Snapshot what's due when the page opens, so answering doesn't reshuffle the session.
  const [session, setSession] = useState<PracticeItem[] | null>(null)
  const snapshot = () =>
    setSession(shuffle(items.filter((it) => data.reviews[it.id] && isDue(data.reviews[it.id], today))))
  useEffect(() => {
    snapshot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, today])

  const known = new Set(items.map((i) => i.id))
  const reviews = Object.values(data.reviews).filter((r) => known.has(r.itemId))
  const active = reviews.filter((r) => r.box < RETIRED)
  const retired = reviews.length - active.length
  const upcoming = active.filter((r) => !isDue(r, today)).map((r) => r.dueDate!).sort()
  const byBox = [1, 2, 3, 4].map((b) => active.filter((r) => r.box === b).length)

  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Mistakes deck</h1>
      <p className="mt-1 text-muted">
        Anything you get wrong comes back here: tomorrow, then after 3 days, a week, two weeks — then it retires.
      </p>

      <div className="card mt-6 p-5 sm:p-7">
        {session === null ? null : session.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-rounded text-[24px] font-semibold">Nothing due today 🌷</p>
            <p className="mt-1 text-muted">
              {upcoming.length
                ? `Next one comes back ${upcoming[0] === addDays(today, 1) ? 'tomorrow' : `on ${fmtDayLong(upcoming[0])}`}.`
                : active.length === 0
                  ? 'Your deck is empty. Mistakes from quizzes, flashcards and cases will land here.'
                  : ''}
            </p>
            <Link href="/quiz" className="btn btn-soft mt-5">
              Try a quick quiz
            </Link>
          </div>
        ) : (
          <PracticeRunner items={session} showTopic onRestart={snapshot} restartLabel="Done for today" />
        )}
      </div>

      {reviews.length > 0 && (
        <section className="mt-8" aria-labelledby="deck-shape">
          <h2 id="deck-shape" className="text-[20px] font-semibold">
            Your deck
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {byBox.map((n, i) => (
              <li key={i} className="card px-4 py-3">
                <p className="font-rounded text-[24px] font-semibold">{n}</p>
                <p className="text-[13px] text-muted">
                  Box {i + 1} · {BOX_LABEL[i + 1]}
                </p>
              </li>
            ))}
            <li className="card bg-sage-soft px-4 py-3">
              <p className="font-rounded text-[24px] font-semibold text-sage-ink">{retired}</p>
              <p className="text-[13px] text-muted">Retired — learnt</p>
            </li>
          </ul>
        </section>
      )}
    </div>
  )
}
