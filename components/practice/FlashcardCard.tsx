'use client'

import { useState } from 'react'
import type { Flashcard } from '@/lib/types'
import { useApp } from '../AppProvider'

export function FlashcardCard({ id, card, onResult }: { id: string; card: Flashcard; onResult?: (correct: boolean) => void }) {
  const { recordResult } = useApp()
  const [flipped, setFlipped] = useState(false)

  function mark(ok: boolean) {
    recordResult(id, 'flashcard', ok, ok ? 'got it' : 'again')
    onResult?.(ok)
  }

  return (
    <div>
      <button
        className="flip-card block w-full text-left"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show the question' : 'Flip to see the answer'}
      >
        <div className={`flip-inner grid min-h-[220px] ${flipped ? 'flipped' : ''}`}>
          <div className="flip-face col-start-1 row-start-1 flex flex-col justify-between rounded-[22px] bg-gradient-to-br from-lilac-soft to-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-lilac/60">
            <p className="eyebrow text-lilac-ink">Question</p>
            <p className="my-4 text-center font-rounded text-[22px] font-semibold leading-snug">{card.front}</p>
            <p className="text-center text-[13px] text-muted">Tap to flip</p>
          </div>
          <div className="flip-face flip-back col-start-1 row-start-1 flex flex-col justify-between rounded-[22px] bg-gradient-to-br from-sage-soft to-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-sage">
            <p className="eyebrow text-sage-ink">Answer</p>
            <p className="my-4 text-center text-[19px] leading-snug">{card.back}</p>
            <p className="text-center text-[13px] text-muted">Tap to flip back</p>
          </div>
        </div>
      </button>
      <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity ${flipped ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!flipped}>
        <button className="btn btn-soft min-h-12" onClick={() => mark(false)} tabIndex={flipped ? 0 : -1}>
          Again
        </button>
        <button className="btn min-h-12 bg-sage text-sage-ink hover:bg-[#c8e8d6]" onClick={() => mark(true)} tabIndex={flipped ? 0 : -1}>
          Got it
        </button>
      </div>
    </div>
  )
}
