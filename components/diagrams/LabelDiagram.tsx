'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, ResetIcon } from '../icons'
import { DIAGRAMS } from './Diagrams'

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Can this topic's label exercise be drawn? (Needs a built-in diagram with hotspots.) */
export function canLabel(diagramId: string, targets: string[]) {
  const def = DIAGRAMS[diagramId]
  return !!def?.spots && targets.every((t) => def.spots![t])
}

/**
 * Label the diagram: tap a label then a numbered spot, or drag a label onto
 * a spot. "Check" gives feedback per label.
 */
export function LabelDiagram({ diagramId, targets }: { diagramId: string; targets: string[] }) {
  const def = DIAGRAMS[diagramId]!
  const [w, h] = def.viewBox
  // Spot numbers are fixed (reading order); the label tray is shuffled.
  const spots = useMemo(
    () => [...targets].sort((a, b) => def.spots![a].y - def.spots![b].y || def.spots![a].x - def.spots![b].x),
    [targets, def],
  )
  const [tray, setTray] = useState<string[]>(targets)
  useEffect(() => setTray(shuffle(targets)), [targets])
  const [placed, setPlaced] = useState<Record<string, string>>({}) // spot target → label
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [drag, setDrag] = useState<{ label: string; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const usedLabels = new Set(Object.values(placed))

  function place(spot: string, label: string) {
    setPlaced((p) => {
      const next = { ...p }
      for (const k of Object.keys(next)) if (next[k] === label) delete next[k]
      next[spot] = label
      return next
    })
    setSelected(null)
    setChecked(false)
  }

  function spotAtPoint(clientX: number, clientY: number): string | null {
    const el = document.elementFromPoint(clientX, clientY)
    const s = el?.closest('[data-spot]')?.getAttribute('data-spot')
    return s ?? null
  }

  function onPointerDown(e: React.PointerEvent, label: string) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    let moved = false
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return
      moved = true
      setDrag({ label, x: ev.clientX, y: ev.clientY })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setDrag(null)
      if (moved) {
        const s = spotAtPoint(ev.clientX, ev.clientY)
        if (s) place(s, label)
      } else {
        setSelected((cur) => (cur === label ? null : label))
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const correctCount = spots.filter((s) => placed[s] === s).length
  const allPlaced = spots.every((s) => placed[s])

  return (
    <div>
      <p className="text-[15px] text-muted">
        Tap a label, then tap its numbered spot — or drag it there. Then check your answers.
      </p>
      <div className="card mt-3 overflow-x-auto p-3 sm:p-5">
        <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="mx-auto block h-auto w-full min-w-[520px] max-w-[760px] select-none" role="group" aria-label="Diagram with numbered spots">
          {def.render(false)}
          {spots.map((s, i) => {
            const { x, y } = def.spots![s]
            const has = placed[s]
            const ok = checked && has === s
            const bad = checked && has && has !== s
            const fill = ok ? '#d9f0e3' : bad ? '#fcebee' : has ? '#e5daf5' : '#ffffff'
            const stroke = ok ? '#2c6a4d' : bad ? '#9a4560' : '#5a4590'
            return (
              <g
                key={s}
                data-spot={s}
                role="button"
                tabIndex={0}
                aria-label={`Spot ${i + 1}${has ? `: ${has}` : ''}`}
                onClick={() => selected && place(s, selected)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selected) place(s, selected)
                }}
                style={{ cursor: selected ? 'pointer' : 'default' }}
              >
                <circle cx={x} cy={y} r={24} fill="transparent" />
                <circle cx={x} cy={y} r={16} fill={fill} stroke={stroke} strokeWidth={2.4} className={selected ? 'animate-pulse' : ''} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill={stroke}>
                  {i + 1}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {spots.map((s, i) => {
          const has = placed[s]
          const ok = checked && has === s
          const bad = checked && has && has !== s
          return (
            <li
              key={s}
              data-spot={s}
              onClick={() => selected && place(s, selected)}
              className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-[15px] ${
                ok ? 'bg-sage-soft' : bad ? 'bg-rose-soft' : 'bg-wash/70'
              } ${selected ? 'cursor-pointer ring-2 ring-lilac' : ''}`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-bold text-lilac-ink">{i + 1}</span>
              <span className={`flex-1 ${has ? 'font-medium' : 'text-faint'}`}>{has ?? 'empty'}</span>
              {ok && <CheckIcon className="size-5 text-sage-ink" />}
              {bad && <span className="text-[13px] text-rose-ink">→ {s}</span>}
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Labels">
        {tray.map((label) => {
          const used = usedLabels.has(label)
          const sel = selected === label
          return (
            <button
              key={label}
              onPointerDown={(e) => onPointerDown(e, label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected((cur) => (cur === label ? null : label))
                }
              }}
              aria-pressed={sel}
              style={{ touchAction: 'none' }}
              className={`min-h-11 rounded-full px-4 text-[15px] font-semibold transition-all ${
                sel
                  ? 'bg-lilac-ink text-white shadow-[var(--shadow-lift)]'
                  : used
                    ? 'bg-wash text-faint line-through decoration-1'
                    : 'bg-lilac-soft text-lilac-ink hover:bg-lilac'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={!allPlaced} onClick={() => setChecked(true)}>
          Check
        </button>
        <button
          className="btn btn-quiet"
          onClick={() => {
            setPlaced({})
            setChecked(false)
            setSelected(null)
            setTray(shuffle(targets))
          }}
        >
          <ResetIcon className="size-[18px]" />
          Start again
        </button>
        {checked && (
          <p className="text-[15px] font-medium" role="status">
            {correctCount === spots.length ? 'All correct — lovely.' : `${correctCount} of ${spots.length} right. The pink ones show where they belong.`}
          </p>
        )}
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lilac-ink px-4 py-2 text-[15px] font-semibold text-white shadow-[var(--shadow-lift)]"
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.label}
        </div>
      )}
    </div>
  )
}
