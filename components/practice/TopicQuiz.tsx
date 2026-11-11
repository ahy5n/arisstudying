'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ladderOrder, levelKey, ROUND_SIZE, toRounds, unlockedRounds } from '@/lib/quizLadder'
import type { PracticeItem } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { BackLink } from '../bits'
import { PracticeRunner } from './PracticeRunner'
import { shuffle } from './shuffle'

/**
 * One topic's quiz in rounds of ten. Get every question in the newest round
 * right and the next round unlocks, up to fifty questions.
 */
export function TopicQuiz({
  topicId,
  topicTitle,
  moduleCode,
  items,
}: {
  topicId: string
  topicTitle: string
  moduleCode: string
  items: PracticeItem[]
}) {
  const data = useData()
  const { setChecklist } = useApp()
  const rounds = useMemo(() => toRounds(ladderOrder(items)), [items])
  const unlocked = unlockedRounds(data.checklists, topicId, rounds.length)
  const [round, setRound] = useState(unlocked - 1)
  const [run, setRun] = useState(0)
  const current = useMemo(() => shuffle(rounds[round] ?? []), [rounds, round, run])

  const finished = (results: boolean[]) => {
    const perfect = results.length > 0 && results.every(Boolean)
    if (perfect && round + 1 === unlocked && unlocked < rounds.length) setChecklist(levelKey(topicId), [unlocked + 1])
  }

  const message = (right: number, total: number) => {
    if (right < total) return `Get all ${total} right to unlock the next round. The ones you missed are in your mistakes deck.`
    if (round + 1 < rounds.length) return `Every single one. 🌷 Round ${round + 2} is unlocked.`
    return 'Every single one, and that was the last round for this topic. 🌷'
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href={`/t/${topicId}`}>
        {moduleCode} · {topicTitle}
      </BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Topic quiz</h1>
      <p className="mt-1 text-muted">
        {rounds.length > 1
          ? `Rounds of ${ROUND_SIZE}. Get a whole round right to unlock the next one.`
          : 'One round so far. More questions unlock as they’re added.'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Rounds">
        {rounds.map((r, k) => {
          const open = k < unlocked
          return (
            <button
              key={k}
              role="tab"
              aria-selected={k === round}
              disabled={!open}
              onClick={() => {
                setRound(k)
                setRun((x) => x + 1)
              }}
              className={`chip px-3.5 py-2 text-[14px] ${k === round ? 'bg-accent text-white' : open ? 'bg-surface ring-1 ring-border hover:ring-accent' : 'bg-bg text-muted opacity-60'}`}
              title={open ? undefined : 'Get the round before it all right to unlock'}
            >
              {open ? '' : '🔒 '}Round {k + 1}
              <span className="ml-1 opacity-70">· {r.length}</span>
            </button>
          )
        })}
      </div>

      <div className="card mt-5 p-5 sm:p-7">
        <PracticeRunner
          items={current}
          onFinish={finished}
          finishMessage={message}
          onRestart={() => setRun((x) => x + 1)}
          restartLabel="Try this round again"
          emptyText="No questions for this topic yet."
          finishExtra={
            round + 1 < unlocked ? (
              <button
                className="btn btn-quiet"
                onClick={() => {
                  setRound(round + 1)
                  setRun((x) => x + 1)
                }}
              >
                Next round
              </button>
            ) : (
              <Link href="/mistakes" className="btn btn-quiet">
                Mistakes deck
              </Link>
            )
          }
        />
      </div>
    </div>
  )
}
