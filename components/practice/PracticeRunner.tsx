'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RETIRED } from '@/lib/leitner'
import type { PracticeItem } from '@/lib/types'
import { useApp } from '../AppProvider'
import { ProgressRing } from '../bits'
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
  onFinish,
  finishMessage,
}: {
  items: PracticeItem[]
  showTopic?: boolean
  onRestart?: () => void
  emptyText?: string
  finishExtra?: React.ReactNode
  restartLabel?: string
  /** Called once when the last item is answered, with each result in order. */
  onFinish?: (results: boolean[]) => void
  /** Replaces the usual end-of-set message. */
  finishMessage?: (right: number, total: number) => React.ReactNode
}) {
  const { data } = useApp()
  const [i, setI] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [answered, setAnswered] = useState(false)
  // Which of these were in the mistakes deck when the set started, so the end
  // screen can say how many old mistakes were cleared.
  const deckAtStart = () => new Set(items.filter((it) => (data?.reviews[it.id]?.box ?? RETIRED) < RETIRED).map((it) => it.id))
  const [wasInDeck, setWasInDeck] = useState(deckAtStart)

  useEffect(() => {
    setI(0)
    setResults([])
    setAnswered(false)
    setWasInDeck(deckAtStart())
    // Only when a new set starts, not every time a result is saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const done = items.length > 0 && i >= items.length
  useEffect(() => {
    if (done) onFinish?.(results)
    // Fire once per finished set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  if (!items.length) return <p className="text-muted">{emptyText}</p>

  if (i >= items.length) {
    const right = results.filter(Boolean).length
    const missed = results.length - right
    const cleared = items.filter((it, k) => results[k] && wasInDeck.has(it.id)).length
    // People remember how a session ended, so end on what went well.
    const headline =
      right === items.length ? 'Every single one. 🌷' : right >= items.length * 0.7 ? 'Lovely work.' : right > 0 ? 'Good practice.' : 'That was a tough set.'
    return (
      <div className="fade-in rounded-[22px] bg-gradient-to-br from-accent-soft via-surface to-accent-soft p-6 text-center sm:p-8">
        <div className="mx-auto w-fit">
          <ProgressRing value={right / items.length} size={88} stroke={8} label={`${right} of ${items.length} right`} />
        </div>
        <p className="mt-3 font-rounded text-[26px] font-semibold">
          {right} of {items.length}
        </p>
        <p className="mt-1 text-[17px] font-semibold">{headline}</p>
        {(cleared > 0 || missed > 0) && (
          <ul className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2 text-[14px]">
            {cleared > 0 && (
              <li className="rounded-full bg-good-soft px-3 py-1.5 font-semibold text-good-ink">
                ✓ {cleared} old mistake{cleared === 1 ? '' : 's'} fixed
              </li>
            )}
            {missed > 0 && (
              <li className="rounded-full bg-bg px-3 py-1.5 font-medium text-muted ring-1 ring-border">
                {missed} saved to your mistakes deck
              </li>
            )}
          </ul>
        )}
        <p className="mt-3 text-muted">
          {finishMessage
            ? finishMessage(right, items.length)
            : right === items.length
              ? 'Nothing to add to your mistakes deck this time.'
              : 'The ones you missed come back in a day or two, until they stick.'}
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
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-bg sm:w-40" aria-hidden>
            <span className="block h-full rounded-full bg-accent/60 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
          </span>
        </div>
        {showTopic &&
          (item.topicId ? (
            <Link href={`/t/${item.topicId}`} className="truncate text-[14px] font-medium text-muted hover:text-ink">
              {item.moduleCode} · {item.topicTitle}
            </Link>
          ) : (
            // Her own flashcards have no lesson to link to.
            <Link href="/flashcards" className="truncate text-[14px] font-medium text-muted hover:text-ink">
              {item.topicTitle}
            </Link>
          ))}
      </div>
      <div key={item.id + i}>
        {item.kind === 'mcq' && <McqCard mcq={item.mcq} onResult={onResult} />}
        {item.kind === 'flashcard' && <FlashcardCard id={item.id} card={item.card} onResult={onResult} />}
        {item.kind === 'case' && <CaseCard id={item.id} kase={item.kase} onResult={onResult} />}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        {item.topicId ? <FlagButton topicId={item.topicId} itemId={item.id} variant="link" label="Flag this question" /> : <span />}
        {answered && (
          <button className="btn btn-primary fade-in" onClick={next} autoFocus>
            {i + 1 === items.length ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
