'use client'

import { useEffect, useState } from 'react'

const KEY = 'oc:mistakes-first'

/** Whether quizzes put questions still in the mistakes deck first. On unless the student turns it off. */
export function useMistakesFirst(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(true)
  useEffect(() => {
    try {
      // Reading a saved choice after the first render keeps server and browser in step.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) === '0') setOn(false)
    } catch {}
  }, [])
  const set = (v: boolean) => {
    setOn(v)
    try {
      if (v) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, '0')
    } catch {}
  }
  return [on, set]
}

export function MistakesFirstToggle({ on, onChange, count }: { on: boolean; onChange: (on: boolean) => void; count: number }) {
  if (count === 0) return null
  return (
    <label className="inline-flex min-h-10 items-center gap-2 text-[14px]">
      <input type="checkbox" className="size-4" checked={on} onChange={(e) => onChange(e.target.checked)} />
      Put my mistakes first
    </label>
  )
}
