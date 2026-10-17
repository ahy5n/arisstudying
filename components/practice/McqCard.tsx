'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Mcq } from '@/lib/types'
import { useApp } from '../AppProvider'
import { AskClaudeButton, wrongAnswerPrompt } from '../AskClaudeButton'
import { CheckIcon, ChevronRight, CloseIcon } from '../icons'
import { shuffle } from './shuffle'

const LETTERS = 'ABCDEFGH'

export function McqCard({ mcq, onResult }: { mcq: Mcq; onResult?: (correct: boolean) => void }) {
  const { recordResult } = useApp()
  // Shuffle after mount so server and client markup agree.
  const [order, setOrder] = useState(() => mcq.options.map((_, i) => i))
  useEffect(() => setOrder(shuffle(mcq.options.map((_, i) => i))), [mcq])
  const [chosen, setChosen] = useState<number | null>(null)

  const answered = chosen !== null
  const correctIdx = mcq.options.findIndex((o) => o.correct)
  const correct = answered && mcq.options[chosen].correct

  function choose(i: number) {
    if (answered) return
    setChosen(i)
    const ok = mcq.options[i].correct
    recordResult(mcq.id, 'mcq', ok, mcq.options[i].text)
    onResult?.(ok)
  }

  return (
    <div>
      <p className="text-[19px] font-medium leading-snug">{mcq.q}</p>
      <ul className="mt-4 space-y-2.5">
        {order.map((i, pos) => {
          const o = mcq.options[i]
          const isChosen = chosen === i
          const showRight = answered && o.correct
          const showWrong = isChosen && !o.correct
          return (
            <li key={i}>
              <button
                onClick={() => choose(i)}
                disabled={answered}
                aria-pressed={isChosen}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[17px] transition-colors ${
                  showRight
                    ? 'border-sage-ink/40 bg-sage-soft'
                    : showWrong
                      ? 'border-rose-ink/40 bg-rose-soft'
                      : answered
                        ? 'border-transparent bg-wash/60 text-muted'
                        : 'border-line bg-card hover:border-lilac hover:bg-lilac-soft/50'
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${
                    showRight ? 'bg-sage text-sage-ink' : showWrong ? 'bg-rose text-rose-ink' : 'bg-wash text-muted'
                  }`}
                >
                  {showRight ? <CheckIcon className="size-4" /> : showWrong ? <CloseIcon className="size-4" /> : LETTERS[pos]}
                </span>
                <span className="flex-1">{o.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="fade-in mt-5 space-y-3" role="status">
          <div className={`rounded-2xl px-4 py-3.5 ${correct ? 'bg-sage-soft' : 'bg-rose-soft'}`}>
            <p className={`font-rounded text-[17px] font-semibold ${correct ? 'text-sage-ink' : 'text-rose-ink'}`}>
              {correct ? 'Correct' : 'Not quite'}
            </p>
            <p className="mt-1 text-[16px]">{mcq.options[chosen].feedback}</p>
          </div>
          <p className="text-[16px] leading-relaxed text-ink">
            <span className="font-semibold">Why: </span>
            {mcq.explanation}
          </p>
          {!correct && (
            <div className="flex flex-wrap items-center gap-2">
              {mcq.link && (
                <Link
                  href={`/t/${mcq.link}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full bg-sky-soft px-3.5 text-[14px] font-semibold text-sky-ink hover:bg-sky"
                >
                  Read more
                  <ChevronRight className="size-4" />
                </Link>
              )}
              <AskClaudeButton
                variant="small"
                label="Ask Claude"
                text={wrongAnswerPrompt(mcq.q, mcq.options[chosen].text, mcq.options[correctIdx]?.text ?? '')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
