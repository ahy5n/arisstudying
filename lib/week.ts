// The weekly summary: what a student did in the last 7 days (UK dates),
// compared with the 7 before, plus what's coming up in the next 7.
import { addDays, todayISO } from './dates'
import { isDue, RETIRED, type ReviewItem } from './leitner'
import type { RecentActivity } from './store/types'
import type { Assessment } from './tracker'

/** A timetabled session, in the few fields the summary needs. */
export interface WeekSession {
  date: string
  title: string
  module: string | null
  isAssessment: boolean
}

export interface WeekTopic {
  id: string
  title: string
  moduleCode: string
}

export interface WeekSummary {
  /** First and last day of the week covered, YYYY-MM-DD. */
  from: string
  to: string
  answered: number
  right: number
  answeredBefore: number
  /** The 7 days, oldest first, with how many answers each. */
  days: { date: string; answers: number }[]
  activeDays: number
  topicsTicked: WeekTopic[]
  /** Module with the lowest score this week (at least 5 answers), if any is below 70%. */
  weakest: { moduleCode: string; answered: number; pct: number } | null
  deckDue: number
  deckTotal: number
  comingUp: { date: string; label: string; kind: 'session' | 'assessment' }[]
}

/**
 * The module an item belongs to. Flashcards and cases start with their topic's
 * id; questions don't always, but they do start with their module's short code
 * (clb-k-1 is CLB), like the topic ids themselves.
 */
export function moduleFinder(topics: WeekTopic[]) {
  const sorted = [...topics].sort((a, b) => b.id.length - a.id.length)
  const byPrefix = new Map(topics.map((t) => [t.id.split('-')[0], t.moduleCode]))
  return (itemId: string): string | null =>
    sorted.find((t) => itemId.startsWith(`${t.id}-`) || itemId.startsWith(`${t.id}:`))?.moduleCode ?? byPrefix.get(itemId.split(/[-:]/)[0]) ?? null
}

export function summariseWeek(input: {
  today: string
  activity: RecentActivity
  topics: WeekTopic[]
  reviews: Record<string, ReviewItem>
  timetable: WeekSession[]
  assessments: Assessment[]
}): WeekSummary {
  const { today, activity, topics, reviews, timetable, assessments } = input
  const from = addDays(today, -6)
  const prevFrom = addDays(today, -13)
  const ukDay = (at: string) => todayISO(new Date(at))
  const findModule = moduleFinder(topics)

  const thisWeek = activity.attempts.filter((a) => ukDay(a.at) >= from)
  const before = activity.attempts.filter((a) => {
    const d = ukDay(a.at)
    return d >= prevFrom && d < from
  })

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(from, i)
    return { date, answers: thisWeek.filter((a) => ukDay(a.at) === date).length }
  })

  const byModule = new Map<string, { answered: number; right: number }>()
  for (const a of thisWeek) {
    const code = findModule(a.itemId)
    if (!code) continue
    const m = byModule.get(code) ?? { answered: 0, right: 0 }
    m.answered++
    if (a.correct) m.right++
    byModule.set(code, m)
  }
  let weakest: WeekSummary['weakest'] = null
  for (const [moduleCode, m] of byModule) {
    if (m.answered < 5) continue
    const pct = Math.round((m.right / m.answered) * 100)
    if (pct < 70 && (!weakest || pct < weakest.pct)) weakest = { moduleCode, answered: m.answered, pct }
  }

  const byId = new Map(topics.map((t) => [t.id, t]))
  const topicsTicked = [...new Set(activity.ticked.filter((t) => ukDay(t.at) >= from).map((t) => t.topicId))]
    .map((id) => byId.get(id))
    .filter((t): t is WeekTopic => !!t)

  const active = Object.values(reviews).filter((r) => r.box < RETIRED)
  const until = addDays(today, 7)
  const comingUp = [
    ...timetable
      .filter((s) => s.date > today && s.date <= until && !/independent study/i.test(s.title))
      .map((s) => ({ date: s.date, label: s.module ? `${s.module}: ${s.title}` : s.title, kind: (s.isAssessment ? 'assessment' : 'session') as 'session' | 'assessment' })),
    ...assessments
      .filter((a) => a.date && a.date >= today && a.date <= until)
      .map((a) => ({ date: a.date!, label: `${a.module}: ${a.name}`, kind: 'assessment' as const })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  return {
    from,
    to: today,
    answered: thisWeek.length,
    right: thisWeek.filter((a) => a.correct).length,
    answeredBefore: before.length,
    days,
    activeDays: days.filter((d) => d.answers > 0).length,
    topicsTicked,
    weakest,
    deckDue: active.filter((r) => isDue(r, today)).length,
    deckTotal: active.length,
    comingUp,
  }
}
