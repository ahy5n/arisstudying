// Topic quizzes come in rounds of 10. Getting every question in a round
// right unlocks the next round, up to 50 questions per topic.
import type { PracticeItem } from './types'

export const ROUND_SIZE = 10
export const MAX_QUESTIONS = 50

/** Where a topic's unlocked-round count is saved (reuses the synced checklist store). */
export function levelKey(topicId: string): string {
  return `quiz-level:${topicId}`
}

/** Unlocked rounds for a topic, at least 1. Stored as [n]. */
export function unlockedRounds(saved: Record<string, number[]>, topicId: string, total: number): number {
  const n = saved[levelKey(topicId)]?.[0] ?? 1
  return Math.max(1, Math.min(n, total))
}

/**
 * Fixed question order for a topic: multiple choice with a written question
 * after every four, so each round mixes the two. Capped at MAX_QUESTIONS.
 */
export function ladderOrder(items: PracticeItem[]): PracticeItem[] {
  const mcq = items.filter((i) => i.kind === 'mcq')
  const cases = items.filter((i) => i.kind === 'case')
  const out: PracticeItem[] = []
  while (mcq.length || cases.length) {
    out.push(...mcq.splice(0, cases.length ? 4 : mcq.length))
    if (cases.length) out.push(cases.shift()!)
  }
  return out.slice(0, MAX_QUESTIONS)
}

export function toRounds<T>(items: T[]): T[][] {
  const rounds: T[][] = []
  for (let i = 0; i < items.length; i += ROUND_SIZE) rounds.push(items.slice(i, i + ROUND_SIZE))
  return rounds
}
