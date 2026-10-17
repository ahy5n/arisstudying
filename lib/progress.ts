import type { ModuleView } from './types'

/** The slim module shape the client-side library needs. */
export interface LibraryModule {
  code: string
  name: string
  theme: string
  colour: string
  hasContent: boolean
  rowIds: string[]
}

export const toLibraryModule = (m: ModuleView): LibraryModule => ({
  code: m.code,
  name: m.name,
  theme: m.theme,
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
