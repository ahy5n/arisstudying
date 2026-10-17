'use client'

import type { Checklist } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { CheckIcon, ResetIcon } from '../icons'

export function ChecklistCard({ checklist, compact = false }: { checklist: Checklist; compact?: boolean }) {
  const { setChecklist, toggleChecklistStep } = useApp()
  const data = useData()
  const done = new Set(data.checklists[checklist.id] ?? [])
  const count = checklist.steps.filter((_, i) => done.has(i)).length

  const toggle = (i: number) => toggleChecklistStep(checklist.id, i)

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-sage-soft px-5 py-4">
        <div>
          {!compact && <p className="eyebrow text-sage-ink">Checklist</p>}
          <h3 className="font-rounded text-[19px] font-semibold">{checklist.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-sage-ink" aria-live="polite">
            {count} of {checklist.steps.length}
          </span>
          <button className="btn btn-ghost min-h-11 px-3 text-[14px]" onClick={() => setChecklist(checklist.id, [])} disabled={count === 0}>
            <ResetIcon className="size-4" />
            Reset
          </button>
        </div>
      </div>
      <ol className="divide-y divide-line/70">
        {checklist.steps.map((step, i) => {
          const on = done.has(i)
          return (
            <li key={i}>
              <button
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(i)}
                className="flex min-h-14 w-full items-start gap-3.5 px-5 py-3 text-left hover:bg-wash/50"
              >
                <span
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                    on ? 'border-sage-ink bg-sage-ink text-white' : 'border-line bg-white'
                  }`}
                >
                  {on && <CheckIcon className="size-4" />}
                </span>
                <span className={`flex-1 text-[17px] ${on ? 'text-muted line-through decoration-sage-ink/40' : ''}`}>
                  <span className="mr-1.5 text-[14px] font-semibold text-faint">{i + 1}.</span>
                  {step}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
