import type { ModuleView } from './types'

/** The slim module shape the client-side library needs. */
export interface LibraryModule {
  code: string
  name: string
  theme: string
  years: number[]
  colour: string
  hasContent: boolean
  rowIds: string[]
}

export const toLibraryModule = (m: ModuleView): LibraryModule => ({
  code: m.code,
  name: m.name,
  theme: m.theme,
  years: m.years,
  colour: m.colour,
  hasContent: m.hasContent,
  rowIds: m.rows.map((r) => r.id),
})

/** Covered + revised ticks ÷ (2 × topics). */
export function moduleProgress(rowIds: string[], progress: Record<string, { covered: boolean; revised: boolean }>) {
  if (!rowIds.length) return 0
  let ticks = 0
  for (const id of rowIds) {
    const p = progress[id]
    if (p?.covered) ticks++
    if (p?.revised) ticks++
  }
  return ticks / (rowIds.length * 2)
}

/** "Year 2", "Years 1–3" or "Years 1, 2, 4". */
export function yearLabel(years: number[]): string {
  if (!years.length) return ''
  const sorted = [...new Set(years)].sort((a, b) => a - b)
  if (sorted.length === 1) return `Year ${sorted[0]}`
  const contiguous = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1)
  return contiguous ? `Years ${sorted[0]}–${sorted[sorted.length - 1]}` : `Years ${sorted.join(', ')}`
}
