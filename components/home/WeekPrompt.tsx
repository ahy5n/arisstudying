'use client'

import Link from 'next/link'
import { weekdayIndex } from '@/lib/dates'
import { useApp } from '../AppProvider'

/** On Sundays and Mondays, a nudge to look at the weekly summary. */
export function WeekPrompt() {
  const { today } = useApp()
  const day = weekdayIndex(today)
  if (day !== 6 && day !== 0) return null
  return (
    <Link href="/week" className="card flex items-center justify-between gap-3 px-5 py-4 hover:ring-1 hover:ring-accent">
      <span>
        <span className="block text-[16px] font-semibold">Your weekly summary is ready</span>
        <span className="block text-[14px] text-muted">What you did this week, and what’s coming up.</span>
      </span>
      <span aria-hidden className="shrink-0 text-[20px] text-accent">
        →
      </span>
    </Link>
  )
}
