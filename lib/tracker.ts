// Weighted-average maths for the 70% tracker.

export interface Assessment {
  id: string
  name: string
  module: string
  weight: number | null
  mark: number | null
  passFail: boolean
  date: string | null
}

export const TARGET = 70

export interface TrackerSummary {
  /** Weighted average of marked, graded items (null when none). */
  average: number | null
  markedWeight: number
  remainingWeight: number
  totalWeight: number
  /** Average needed across remaining weighted items to finish on 70%. */
  needed: number | null
  state: 'empty' | 'secured' | 'on-track' | 'stretch' | 'out-of-reach' | 'done'
  /** Graded items with a mark but no weighting yet. */
  unweightedMarked: number
  /** Graded items with neither weighting nor mark — still to come, size unknown. */
  unweightedPending: number
}

export function summarise(items: Assessment[], target = TARGET): TrackerSummary {
  const graded = items.filter((a) => !a.passFail)
  const weighted = graded.filter((a) => a.weight != null && a.weight > 0)
  const marked = weighted.filter((a) => a.mark != null)
  const remaining = weighted.filter((a) => a.mark == null)
  const markedWeight = marked.reduce((s, a) => s + a.weight!, 0)
  const remainingWeight = remaining.reduce((s, a) => s + a.weight!, 0)
  const totalWeight = markedWeight + remainingWeight
  const points = marked.reduce((s, a) => s + a.weight! * a.mark!, 0)
  const average = markedWeight > 0 ? points / markedWeight : null
  const unweighted = graded.filter((a) => !(a.weight != null && a.weight > 0))
  const unweightedMarked = unweighted.filter((a) => a.mark != null).length
  const unweightedPending = unweighted.length - unweightedMarked
  const base = { average, markedWeight, remainingWeight, totalWeight, unweightedMarked, unweightedPending }

  // Nothing weighted left to aim at: either nothing entered yet, or the
  // rest of the year still needs its weightings before we can say more.
  if (totalWeight === 0 || (remainingWeight === 0 && unweightedPending > 0)) {
    return { ...base, needed: null, state: 'empty' }
  }
  if (remainingWeight === 0) {
    return { ...base, needed: null, state: 'done' }
  }
  const needed = (target * totalWeight - points) / remainingWeight
  let state: TrackerSummary['state']
  if (needed <= 0) state = 'secured'
  else if (needed <= target) state = 'on-track'
  else if (needed <= 100) state = 'stretch'
  else state = 'out-of-reach'
  return { ...base, needed, state }
}
