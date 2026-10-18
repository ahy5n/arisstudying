// Lecture slides and materials (data/slides.json), mapped to timetable
// sessions by date + start time.
import fs from 'node:fs'
import path from 'node:path'

export interface SessionRef {
  date: string
  start: string
}

export interface Deck {
  id: string
  title: string
  file: string
  module: string
  lead: string
  kind: string
  week: number
  sessions: SessionRef[]
  alsoUseful?: SessionRef[]
  topics: string[]
  checked?: boolean
  slideCount?: number
  /** 'outlined' (default when an outline exists), 'not-uploaded' or 'after-lecture'. */
  status?: 'not-uploaded' | 'after-lecture'
  note?: string
  summary?: string
  takeaways?: string[]
  outline?: { slides: string; title: string; points: string[] }[]
}

/** What a session row needs to show its materials. */
export interface MaterialLink {
  id: string
  title: string
  kind: string
  outlined: boolean
}

export const sessionKey = (s: SessionRef) => `${s.date}T${s.start}`

export function getDecks(): Deck[] {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'slides.json'), 'utf8')) as { decks: Deck[] }
  return raw.decks
}

export const isOutlined = (d: Deck) => !!d.outline?.length

export function getDeck(id: string) {
  return getDecks().find((d) => d.id === id)
}

export function materialsBySession(): Record<string, MaterialLink[]> {
  const map: Record<string, MaterialLink[]> = {}
  for (const d of getDecks()) {
    for (const s of d.sessions) {
      ;(map[sessionKey(s)] ??= []).push({ id: d.id, title: d.title, kind: d.kind, outlined: isOutlined(d) })
    }
  }
  return map
}

export function decksForTopic(topicId: string) {
  return getDecks()
    .filter((d) => d.topics.includes(topicId))
    .map((d) => ({ id: d.id, title: d.title, module: d.module, week: d.week, kind: d.kind, checked: !!d.checked && isOutlined(d), outlined: isOutlined(d) }))
}

export function decksForModule(code: string) {
  return getDecks()
    .filter((d) => d.module === code)
    .map((d) => ({ id: d.id, title: d.title, week: d.week, kind: d.kind, outlined: isOutlined(d), status: d.status ?? null }))
}
