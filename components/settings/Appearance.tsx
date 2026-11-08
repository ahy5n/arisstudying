'use client'

import { useEffect, useState } from 'react'
import { PALETTES } from '@/lib/palettes'
import { type Mode, type Palette, PALETTE_ORDER } from '@/lib/theme'
import { CheckIcon } from '../icons'
import { Logo } from '../Logo'
import { useTheme } from '../useTheme'

const ABOUT: Record<Palette, { name: string; line: string }> = {
  prism: { name: 'Prism', line: 'Violet. Bold and focused.' },
  focus: { name: 'Focus', line: 'Teal. Calm and clear.' },
  companion: { name: 'Companion', line: 'Terracotta. Warm and friendly.' },
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** Whether the page is showing dark colours right now. */
function useShowingDark(mode: Mode) {
  const [systemDark, setSystemDark] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const on = () => setSystemDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mode === 'dark' || (mode === 'system' && systemDark)
}

export function Appearance() {
  const { theme, setPalette, setMode } = useTheme()
  const dark = useShowingDark(theme.mode)

  return (
    <section className="card mt-6 p-6" aria-labelledby="appearance">
      <h2 id="appearance" className="text-[20px] font-semibold">
        Appearance
      </h2>

      <p className="mt-4 text-[14px] font-semibold" id="palette-label">
        Colour theme
      </p>
      <div role="radiogroup" aria-labelledby="palette-label" className="mt-2 grid gap-3 sm:grid-cols-3">
        {PALETTE_ORDER.map((p) => {
          const c = PALETTES[p][dark ? 'dark' : 'light']
          const on = theme.palette === p
          return (
            <button
              key={p}
              role="radio"
              aria-checked={on}
              onClick={() => setPalette(p)}
              className={`relative flex min-h-[148px] flex-col rounded-[14px] border-2 p-4 text-left transition-colors ${
                on ? 'border-accent' : 'border-border hover:border-muted/50'
              }`}
              // Each card previews its own palette, whatever the current theme.
              style={{ background: c.surface, color: c.ink, ['--accent' as string]: c.accent, ['--ink' as string]: c.ink }}
            >
              <span className="flex items-start justify-between gap-2">
                <Logo size={28} withWordmark={false} />
                {on ? (
                  <span className="grid size-6 place-items-center rounded-full" style={{ background: c.accent, color: c['on-accent'] }}>
                    <CheckIcon className="size-4" />
                  </span>
                ) : (
                  p === 'prism' && (
                    <span className="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold" style={{ background: c['accent-soft'], color: c.ink }}>
                      Default
                    </span>
                  )
                )}
              </span>
              <span className="mt-3 text-[16px] font-semibold">
                {ABOUT[p].name}
                {on && p === 'prism' && <span className="ml-2 text-[12px] font-medium" style={{ color: c.muted }}>Default</span>}
              </span>
              <span className="mt-0.5 text-[13.5px]" style={{ color: c.muted }}>
                {ABOUT[p].line}
              </span>
              <span className="mt-auto flex gap-1.5 pt-3" aria-hidden>
                {[c.bg, c.ink, c.accent, c['accent-soft']].map((s, i) => (
                  <span key={i} className="size-5 rounded-full" style={{ background: s, boxShadow: `inset 0 0 0 1px ${c.border}` }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-[14px] font-semibold" id="mode-label">
        Mode
      </p>
      <div role="radiogroup" aria-labelledby="mode-label" className="mt-2 inline-grid grid-cols-3 rounded-[11px] bg-accent-soft p-1">
        {MODES.map((m) => {
          const on = theme.mode === m.value
          return (
            <button
              key={m.value}
              role="radio"
              aria-checked={on}
              onClick={() => setMode(m.value)}
              className={`min-h-10 rounded-[8px] px-5 text-[14px] font-semibold transition-colors ${
                on ? 'bg-surface text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[13px] text-muted">System follows your device’s light or dark setting.</p>
    </section>
  )
}

export function AboutApp() {
  return (
    <section className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6" aria-labelledby="about-app">
      <h2 id="about-app" className="sr-only">
        About
      </h2>
      <Logo size={34} />
      <p className="text-[13px] text-muted">Your study space.</p>
    </section>
  )
}
