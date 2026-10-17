'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { RETIRED } from '@/lib/leitner'
import type { PracticeItem } from '@/lib/types'
import { useData } from '../AppProvider'
import { BackLink } from '../bits'
import { PracticeRunner } from './PracticeRunner'
import { shuffle, weightedSample } from './shuffle'

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
  subtitle: string
  backHref: string
  backLabel: string
}) {
  const data = useData()
  const [picked, setPicked] = useState<PracticeItem[] | null>(null)

  const pick = useCallback(() => {
    if (mode === 'all') return setPicked(shuffle(items))
    setPicked(
      weightedSample(items, 10, (it) => {
        const r = data.reviews[it.id]
        if (!r) return 1
        // Ever wrong → much more likely; still in the deck → more again.
        return r.box < RETIRED ? 6 : 3
      }),
    )
    // Only re-pick on demand, not every time a result is saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mode])

  useEffect(() => pick(), [pick])

  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href={backHref}>{backLabel}</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
      <div className="card mt-6 p-5 sm:p-7">
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
