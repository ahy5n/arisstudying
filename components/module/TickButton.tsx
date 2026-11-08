'use client'

import { CheckIcon } from '../icons'

export function TickButton({
  label,
  on,
  onToggle,
  tone,
  describedBy,
}: {
  label: string
  on: boolean
  onToggle: () => void
  tone: 'sage' | 'lilac'
  describedBy?: string
}) {
  const onCls = tone === 'sage' ? 'bg-good text-good-ink' : 'bg-accent-tint text-accent'
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      aria-describedby={describedBy}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition-colors ${
        on ? onCls : 'bg-bg text-muted hover:text-ink'
      }`}
    >
      <span
        className={`grid size-5 place-items-center rounded-full border-[1.5px] ${
          on ? 'border-transparent bg-surface/70' : 'border-current/40'
        }`}
      >
        {on && <CheckIcon className="size-3.5" />}
      </span>
      {label}
    </button>
  )
}
