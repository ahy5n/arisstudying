'use client'

import Link from 'next/link'
import { ROUND_SIZE, unlockedRounds } from '@/lib/quizLadder'
import { useData } from '../AppProvider'

interface Group {
  code: string
  name: string
  topics: { id: string; title: string; count: number }[]
}

/** Every topic quiz, grouped by module, with how many rounds are unlocked. */
export function TopicQuizList({ groups }: { groups: Group[] }) {
  const data = useData()
  return (
    <section className="mt-10" aria-labelledby="topic-quizzes">
      <h2 id="topic-quizzes" className="text-[22px] font-semibold">
        Topic quizzes
      </h2>
      <p className="mt-1 text-muted">Rounds of {ROUND_SIZE}. Get a whole round right to unlock the next, up to 50 questions a topic.</p>
      <div className="mt-4 space-y-3">
        {groups.map((g) => (
          <details key={g.code} className="card group p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="font-semibold">
                {g.code} <span className="font-normal text-muted">· {g.name}</span>
              </span>
              <span className="text-[14px] text-muted">{g.topics.length} topics</span>
            </summary>
            <ul className="mt-3 divide-y divide-border/70">
              {g.topics.map((t) => {
                const total = Math.ceil(t.count / ROUND_SIZE)
                const open = unlockedRounds(data.checklists, t.id, total)
                return (
                  <li key={t.id}>
                    <Link href={`/t/${t.id}/quiz`} className="flex items-center justify-between gap-3 py-2.5 hover:text-accent-strong">
                      <span className="min-w-0 truncate">{t.title}</span>
                      <span className="shrink-0 text-[13px] text-muted">
                        {t.count} questions · round {open} of {total}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </details>
        ))}
      </div>
    </section>
  )
}
