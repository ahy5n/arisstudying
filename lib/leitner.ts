// Simple Leitner schedule for the mistakes deck.
// box 1 → tomorrow, 2 → 3 days, 3 → 7 days, 4 → 14 days, then retired (box 5).
import { addDays } from './dates'
import type { ItemKind } from './types'

export const RETIRED = 5
const INTERVAL: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14 }

export interface ReviewItem {
  itemId: string
  itemType: ItemKind
  box: number
  dueDate: string | null
  lastResult: 'correct' | 'wrong'
}

export function isDue(r: ReviewItem, today: string): boolean {
  return r.box < RETIRED && !!r.dueDate && r.dueDate <= today
}

/**
 * Returns the updated review item, or null when nothing should be stored
 * (a correct answer on something that was never wrong).
 * - Wrong anywhere → back to box 1, due tomorrow.
 * - Correct while due → up one box (box 4 → retired).
 * - Correct but not due yet → schedule unchanged, so practising the
 *   same card twice in a day can't skip boxes.
 */
export function schedule(
  existing: ReviewItem | undefined,
  itemId: string,
  itemType: ItemKind,
  correct: boolean,
  today: string,
): ReviewItem | null {
  if (!correct) {
    return { itemId, itemType, box: 1, dueDate: addDays(today, INTERVAL[1]), lastResult: 'wrong' }
  }
  if (!existing) return null
  if (!isDue(existing, today)) return { ...existing, lastResult: 'correct' }
  const box = existing.box + 1
  return {
    itemId,
    itemType,
    box,
    dueDate: box >= RETIRED ? null : addDays(today, INTERVAL[box]),
    lastResult: 'correct',
  }
}
