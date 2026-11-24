'use client'

import { useEffect, useState } from 'react'

/**
 * A one-line tip shown the first time someone reaches a feature, instead of
 * a help page nobody reads. "Got it" hides it on this device for good.
 */
export function FirstTimeTip({ id, children }: { id: string; children: React.ReactNode }) {
  const key = `oc:tip:${id}`
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      // Checked after the first render so server and browser HTML match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(!localStorage.getItem(key))
    } catch {}
  }, [key])
  if (!show) return null
  return (
    <div role="note" className="fade-in mt-4 flex items-start gap-3 rounded-[14px] bg-accent-soft px-4 py-3 text-[14.5px] leading-snug">
      <span aria-hidden className="mt-0.5">💡</span>
      <p className="min-w-0 flex-1">{children}</p>
      <button
        type="button"
        className="-my-1 min-h-9 shrink-0 rounded-lg px-2 text-[14px] font-semibold text-accent-strong hover:bg-surface"
        onClick={() => {
          setShow(false)
          try {
            localStorage.setItem(key, '1')
          } catch {}
        }}
      >
        Got it
      </button>
    </div>
  )
}
