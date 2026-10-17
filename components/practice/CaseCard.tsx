'use client'

import { useState } from 'react'
import type { ClinicalCase } from '@/lib/types'
import { useApp } from '../AppProvider'

const MARKS = [
  { key: 'nailed', label: 'Nailed it', correct: true, cls: 'bg-sage text-sage-ink hover:bg-[#c8e8d6]' },
  { key: 'partly', label: 'Partly', correct: false, cls: 'bg-butter text-butter-ink hover:bg-[#f7e6bb]' },
  { key: 'missed', label: 'Missed it', correct: false, cls: 'bg-rose-soft text-rose-ink hover:bg-rose' },
] as const

export function CaseCard({ id, kase, onResult }: { id: string; kase: ClinicalCase; onResult?: (correct: boolean) => void }) {
  const { recordResult } = useApp()
  const [answer, setAnswer] = useState('')
  const [shown, setShown] = useState(false)
  const [marked, setMarked] = useState<string | null>(null)

  return (
    <div>
      <div className="rounded-2xl bg-sky-soft px-5 py-4">
        <p className="eyebrow text-sky-ink">Patient</p>
        <p className="mt-1 text-[17px] leading-relaxed">{kase.scenario}</p>
      </div>
      <p className="mt-4 text-[19px] font-medium leading-snug">{kase.question}</p>
      <textarea
        className="field mt-3 min-h-28 resize-y"
        placeholder="Type your answer, or just think it through…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        aria-label="Your answer"
      />
      {!shown ? (
        <button className="btn btn-primary mt-3" onClick={() => setShown(true)}>
          Show model answer
        </button>
      ) : (
        <div className="fade-in mt-4">
          <div className="rounded-2xl bg-sage-soft px-5 py-4">
            <p className="eyebrow text-sage-ink">Model answer</p>
            <p className="mt-1 text-[17px] leading-relaxed">{kase.modelAnswer}</p>
          </div>
          <p className="mt-4 text-[15px] font-medium text-muted">How did you do?</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {MARKS.map((m) => (
              <button
                key={m.key}
                disabled={!!marked}
                aria-pressed={marked === m.key}
                onClick={() => {
                  setMarked(m.key)
                  recordResult(id, 'case', m.correct, m.key)
                  onResult?.(m.correct)
                }}
                className={`btn min-h-12 px-2 ${m.cls} ${marked && marked !== m.key ? 'opacity-40' : ''} ${marked === m.key ? 'ring-2 ring-current' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {marked && marked !== 'nailed' && (
            <p className="mt-3 text-[14px] text-muted">Added to your mistakes deck for another go later.</p>
          )}
        </div>
      )}
    </div>
  )
}
