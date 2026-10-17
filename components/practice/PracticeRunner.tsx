'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { PracticeItem } from '@/lib/types'
import { FlagButton } from '../FlagButton'
import { ResetIcon } from '../icons'
import { CaseCard } from './CaseCard'
import { FlashcardCard } from './FlashcardCard'
import { McqCard } from './McqCard'

/**
 * Runs a list of practice items one at a time. Flashcards move on as soon
 * as they're marked; questions and cases wait for "Next" so the feedback
 * can be read.
 */
export function PracticeRunner({
  items,
  showTopic = false,
  onRestart,
  emptyText = 'Nothing here yet.',
  finishExtra,
  restartLabel = 'Go again',
}: {
  items: PracticeItem[]
  showTopic?: boolean
  onRestart?: () => void
  emptyText?: string
  finishExtra?: React.ReactNode
  restartLabel?: string
}) {
  const [i, setI] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    setI(0)
    setResults([])
    setAnswered(false)
  }, [items])

  if (!items.length) return <p className="text-muted">{emptyText}</p>

  if (i >= items.length) {
    const right = results.filter(Boolean).length
    return (
      <div className="fade-in rounded-[22px] bg-gradient-to-br from-rose-soft via-white to-lilac-soft p-6 text-center sm:p-8">
        <p className="font-rounded text-[26px] font-semibold">
          {right} of {items.length}
        </p>
        <p className="mt-1 text-muted">
          {right === items.length
            ? 'Every single one. 🌷'
            : right >= items.length * 0.7
              ? 'Lovely work. The ones you missed are in your mistakes deck.'
              : 'Good practice — the ones you missed are saved in your mistakes deck for later.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (onRestart) onRestart()
              else {
                setI(0)
                setResults([])
                setAnswered(false)
              }
            }}
          >
            <ResetIcon className="size-[18px]" />
            {restartLabel}
          </button>
          {finishExtra}
        </div>
      </div>
    )
  }

  const item = items[i]
  const next = () => {
    setI((x) => x + 1)
    setAnswered(false)
  }
  const onResult = (ok: boolean) => {
    setResults((r) => [...r, ok])
    if (item.kind === 'flashcard') setTimeout(next, 250)
    else setAnswered(true)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[14px] font-medium text-muted">
          <span>
            {i + 1} of {items.length}
          </span>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-wash sm:w-40" aria-hidden>
            <span className="block h-full rounded-full bg-rose-ink/60 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
          </span>
        </div>
        {showTopic && (
          <Link href={`/t/${item.topicId}`} className="truncate text-[14px] font-medium text-muted hover:text-ink">
            {item.moduleCode} · {item.topicTitle}
          </Link>
        )}
      </div>
      <div key={item.id + i}>
        {item.kind === 'mcq' && <McqCard mcq={item.mcq} onResult={onResult} />}
        {item.kind === 'flashcard' && <FlashcardCard id={item.id} card={item.card} onResult={onResult} />}
        {item.kind === 'case' && <CaseCard id={item.id} kase={item.kase} onResult={onResult} />}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <FlagButton topicId={item.topicId} itemId={item.id} variant="link" label="Flag this question" />
        {answered && (
          <button className="btn btn-primary fade-in" onClick={next} autoFocus>
            {i + 1 === items.length ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
