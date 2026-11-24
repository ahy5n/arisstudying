'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { RETIRED } from '@/lib/leitner'
import type { PracticeItem } from '@/lib/types'
import { useData } from '../AppProvider'
import { BackLink } from '../bits'
import { FirstTimeTip } from '../FirstTimeTip'
import { PracticeRunner } from './PracticeRunner'
import { MistakesFirstToggle, useMistakesFirst } from './MistakesFirst'
import { mistakesFirst, shuffle, weightedSample } from './shuffle'

/**
 * mode "quick": 10 random questions from all full modules, weighted towards
 * ones she's got wrong before. mode "all": every question, shuffled.
 */
export function QuizPage({
  items,
  mode,
  title,
  subtitle,
  backHref,
  backLabel,
}: {
  items: PracticeItem[]
  mode: 'quick' | 'all'
  title: string
  subtitle: React.ReactNode
  backHref: string
  backLabel: React.ReactNode
}) {
  const data = useData()
  const [picked, setPicked] = useState<PracticeItem[] | null>(null)
  const [first, setFirst] = useMistakesFirst()
  const inDeck = (id: string) => (data.reviews[id]?.box ?? RETIRED) < RETIRED

  const pick = useCallback(() => {
    const set =
      mode === 'all'
        ? shuffle(items)
        : weightedSample(items, 10, (it) => {
            const r = data.reviews[it.id]
            if (!r) return 1
            // Ever wrong → much more likely; still in the deck → more again.
            return r.box < RETIRED ? 6 : 3
          })
    setPicked(first ? mistakesFirst(set, inDeck) : set)
    // Only re-pick on demand, not every time a result is saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mode, first])

  const deckCount = items.filter((it) => inDeck(it.id)).length

  useEffect(() => pick(), [pick])

  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href={backHref}>{backLabel}</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
      <FirstTimeTip id="quiz">
        Questions you get wrong go into your mistakes deck and come back over the next few days until you get them right.
      </FirstTimeTip>
      <div className="mt-4">
        <MistakesFirstToggle on={first} onChange={setFirst} count={deckCount} />
      </div>
      <div className="card mt-3 p-5 sm:p-7">
        {picked && (
          <PracticeRunner
            items={picked}
            showTopic
            onRestart={pick}
            emptyText="No questions yet — they’ll appear here as module content is added."
            finishExtra={
              <Link href="/mistakes" className="btn btn-quiet">
                Mistakes deck
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
