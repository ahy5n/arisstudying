// Shared shape of an "Explain it" marking result (API route ↔ topic page).
export type PointStatus = 'covered' | 'partly' | 'missed'

export interface MarkedPoint {
  /** The key point from the topic, word for word. */
  point: string
  status: PointStatus
  /** One short sentence: what she said, or what was missing. */
  comment: string
}

export interface MarkResult {
  points: MarkedPoint[]
  /** Anything she said that was wrong or muddled. Empty when there's nothing. */
  corrections: string[]
  /** What to add next time, most important first. */
  addNextTime: string[]
  /** One encouraging sentence about what she did well. */
  praise: string
}

export const MAX_ANSWER_CHARS = 6000
export const MIN_ANSWER_CHARS = 40

/** Covered = 1, partly = 0.5. */
export function scoreOf(r: MarkResult): { got: number; total: number } {
  const got = r.points.reduce((s, p) => s + (p.status === 'covered' ? 1 : p.status === 'partly' ? 0.5 : 0), 0)
  return { got, total: r.points.length }
}
