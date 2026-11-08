// Shared building blocks for the inline SVG diagrams.

import type { ReactNode } from 'react'
import { FIG } from './palette'

export type Spot = { x: number; y: number }

export interface DiagramDef {
  viewBox: [number, number]
  /** Short labels on the drawing → full wording, shown as a key. */
  legend?: [string, string][]
  caption?: string
  spots?: Record<string, Spot>
  render: (labelled: boolean) => ReactNode
}

export const INK = FIG.grey800
export const MUTED = FIG.grey600
export const ROSE = FIG.pink600
export const LILAC = FIG.violet600
export const SKY = FIG.blue700
export const SAGE = FIG.green700

export function Arrowheads() {
  return (
    <defs>
      {[
        ['ah', INK],
        ['ah-rose', ROSE],
        ['ah-lilac', LILAC],
        ['ah-sky', SKY],
        ['ah-sage', SAGE],
      ].map(([id, c]) => (
        <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={c} />
        </marker>
      ))}
    </defs>
  )
}

/** Dimension line with arrowheads at both ends. */
export function Dim({ x1, y1, x2, y2, colour = INK, id = 'ah' }: { x1: number; y1: number; x2: number; y2: number; colour?: string; id?: string }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.6} markerStart={`url(#${id})`} markerEnd={`url(#${id})`} />
  )
}

export function T({
  x,
  y,
  children,
  show = true,
  anchor = 'middle',
  size = 15,
  weight = 600,
  fill = INK,
}: {
  x: number
  y: number
  children: ReactNode
  show?: boolean
  anchor?: 'start' | 'middle' | 'end'
  size?: number
  weight?: number
  fill?: string
}) {
  if (!show) return null
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      dominantBaseline="middle"
      stroke={FIG.white}
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  )
}

export function Cross({ x, y, colour = ROSE, r = 7 }: { x: number; y: number; colour?: string; r?: number }) {
  return (
    <g stroke={colour} strokeWidth={2.2} strokeLinecap="round">
      <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} />
      <line x1={x - r} y1={y + r} x2={x + r} y2={y - r} />
    </g>
  )
}

export const ROSE_SOFT = FIG.red50
export const SKY_SOFT = FIG.blue50
export const LILAC_SOFT = FIG.grey50c
export const SAGE_SOFT = FIG.grey50
export const BUTTER = FIG.amber100
export const BUTTER_INK = FIG.amber700
