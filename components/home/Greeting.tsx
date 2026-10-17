'use client'

import { useEffect, useState } from 'react'
import { ukHourNow } from '@/lib/dates'
import { useApp } from '../AppProvider'

const LAST = 'aris:last-encouragement'

function greeting(hour: number) {
  if (hour < 5) return { text: 'Hello, night owl', emoji: '🌙' }
  if (hour < 12) return { text: 'Good morning', emoji: '☁️' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' }
  return { text: 'Good evening', emoji: '🌙' }
}

export function Greeting({ lines }: { lines: string[] }) {
  const { user } = useApp()
  const [line, setLine] = useState<string | null>(null)
  const g = greeting(ukHourNow())

  useEffect(() => {
    // One random line per visit, never the same as last time.
    let last = -1
    try {
      last = Number(localStorage.getItem(LAST) ?? -1)
    } catch {}
    let i = Math.floor(Math.random() * lines.length)
    if (lines.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length
    try {
      localStorage.setItem(LAST, String(i))
    } catch {}
    setLine(lines[i])
  }, [lines])

  const name = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ''
  return (
    <div>
      <h1 className="text-[32px] font-semibold sm:text-[36px]">
        {g.text}
        {name && name.length <= 12 ? `, ${name}` : ''} <span aria-hidden>{g.emoji}</span>
      </h1>
      <p className="mt-1.5 min-h-[1.6em] text-[18px] text-muted">{line ?? ' '}</p>
    </div>
  )
}
