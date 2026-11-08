// Helpers for uploaded slides (ids, session keys, spotting a module code)
// and a reader for .ics calendar files, kept with its tests.
import { addDays, daysBetween } from './dates'
import type { TimetableEntry, UserDeck } from './store/types'

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const sessionKey = (s: { date: string; start: string }) => `${s.date}T${s.start}`

/** A link shown under a session (same shape as lib/slides' MaterialLink, kept here so tests needn't load it). */
export interface MaterialLink {
  id: string
  title: string
  kind: string
  outlined: boolean
  href?: string
}

/** Uploaded decks linked to a session, keyed like the built-in materials. */
export function materialsFrom(decks: UserDeck[]): Record<string, MaterialLink[]> {
  const map: Record<string, MaterialLink[]> = {}
  for (const d of decks) {
    if (!d.sessionDate || !d.sessionStart) continue
    ;(map[`${d.sessionDate}T${d.sessionStart}`] ??= []).push({
      id: d.id,
      title: d.title,
      kind: 'Your slides',
      outlined: d.slides.length > 0,
      href: `/slides/view?id=${encodeURIComponent(d.id)}`,
    })
  }
  return map
}

/** The first module code that appears as a whole word in the text. */
export function detectModule(text: string, codes: string[]): string | null {
  for (const c of codes) {
    if (new RegExp(`(^|[^A-Za-z])${c}([^A-Za-z]|$)`, 'i').test(text)) return c
  }
  return null
}

const ASSESSMENT_WORDS = /\b(exam|assessment|test|ospe|osce|viva|quiz)\b/i

/** One session, or the same session every week until `until` (inclusive). */
export function weeklyEntries(
  base: Omit<TimetableEntry, 'id' | 'series' | 'date' | 'source'>,
  date: string,
  until: string | null,
): TimetableEntry[] {
  if (!until || until <= date) return [{ ...base, id: newId(), series: null, date, source: 'manual' }]
  const series = newId()
  const out: TimetableEntry[] = []
  for (let d = date; d <= until && out.length < 60; d = addDays(d, 7)) {
    out.push({ ...base, id: newId(), series, date: d, source: 'manual' })
  }
  return out
}

// ── .ics calendars ───────────────────────────────────────────────────────

interface IcsProp {
  value: string
  params: Record<string, string>
}

function unfold(text: string): string[] {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n')
}

function parseLine(line: string): [string, IcsProp] | null {
  const colon = line.indexOf(':')
  if (colon < 0) return null
  const [name, ...rawParams] = line.slice(0, colon).split(';')
  const params: Record<string, string> = {}
  for (const p of rawParams) {
    const eq = p.indexOf('=')
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '')
  }
  return [name.toUpperCase(), { value: line.slice(colon + 1), params }]
}

const unescapeText = (v: string) =>
  v.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').replace(/\s+/g, ' ').trim()

const londonParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

interface Moment {
  date: string
  time: string
  utc: Date | null
  allDay: boolean
}

function toMoment(p: IcsProp): Moment | null {
  const m = p.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, , z] = m
  if (!h) return { date: `${y}-${mo}-${d}`, time: '00:00', utc: null, allDay: true }
  if (z) {
    const utc = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi))
    return { ...fromUTC(utc), utc, allDay: false }
  }
  // Floating or TZID times: UK timetables are in UK time, so keep the wall clock.
  return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}`, utc: null, allDay: false }
}

function fromUTC(utc: Date): { date: string; time: string } {
  const parts = Object.fromEntries(londonParts.formatToParts(utc).map((x) => [x.type, x.value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

/** Every start of a recurring event (weekly or daily), capped to a year. */
function expand(start: Moment, rrule: string | undefined, exdates: Set<string>): Moment[] {
  const rule = Object.fromEntries((rrule ?? '').split(';').map((kv) => kv.split('=') as [string, string]))
  const freq = rule.FREQ
  if (freq !== 'WEEKLY' && freq !== 'DAILY') return exdates.has(start.date) ? [] : [start]
  const interval = Math.max(1, Number(rule.INTERVAL ?? 1))
  const count = rule.COUNT ? Number(rule.COUNT) : Infinity
  const until = rule.UNTIL ? toMoment({ value: rule.UNTIL, params: {} })?.date ?? null : null
  const lastDay = addDays(start.date, 366)
  const days =
    freq === 'WEEKLY' && rule.BYDAY
      ? rule.BYDAY.split(',').map((d) => BYDAY.indexOf(d.slice(-2))).filter((i) => i >= 0)
      : null

  const out: Moment[] = []
  let made = 0
  for (let step = 0; made < count && out.length < 400; step++) {
    const offsets = freq === 'DAILY' ? [step * interval] : weekOffsets(start.date, step * interval, days)
    let past = false
    for (const off of offsets) {
      if (made >= count) break
      const at = shift(start, off)
      if (at.date < start.date) continue
      if ((until && at.date > until) || at.date > lastDay) {
        past = true
        break
      }
      made++
      if (!exdates.has(at.date)) out.push(at)
    }
    if (past) break
  }
  return out
}

/** Day offsets from the first start for the given week of the series. */
function weekOffsets(first: string, weekStep: number, days: number[] | null): number[] {
  const firstDow = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7
  if (!days?.length) return [weekStep * 7]
  return [...days].sort((a, b) => a - b).map((dow) => weekStep * 7 + (dow - firstDow))
}

function shift(m: Moment, days: number): Moment {
  if (m.utc) {
    const utc = new Date(m.utc.getTime() + days * 86400000)
    return { ...fromUTC(utc), utc, allDay: false }
  }
  return { ...m, date: addDays(m.date, days) }
}

export interface IcsResult {
  entries: TimetableEntry[]
  skippedAllDay: number
}

/**
 * Reads an .ics file into dated sessions, from four weeks ago to a year
 * ahead. Module codes in the event title or location are picked up.
 */
export function parseIcs(text: string, moduleCodes: string[], today: string): IcsResult {
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('That doesn’t look like a calendar file (.ics).')
  const lines = unfold(text)
  const from = addDays(today, -28)
  const to = addDays(today, 366)
  const events: Record<string, IcsProp | IcsProp[]>[] = []
  let cur: Record<string, IcsProp | IcsProp[]> | null = null
  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) cur = {}
    else if (/^END:VEVENT/i.test(line)) {
      if (cur) events.push(cur)
      cur = null
    } else if (cur) {
      const parsed = parseLine(line)
      if (!parsed) continue
      const [name, prop] = parsed
      if (name === 'EXDATE') cur.EXDATE = [...((cur.EXDATE as IcsProp[] | undefined) ?? []), prop]
      else cur[name] = prop
    }
  }

  // Moved or cancelled single weeks of a series replace that week.
  const overridden = new Set<string>()
  for (const ev of events) {
    const rid = ev['RECURRENCE-ID'] as IcsProp | undefined
    const uid = (ev.UID as IcsProp | undefined)?.value
    const at = rid && toMoment(rid)
    if (uid && at) overridden.add(`${uid}|${at.date}`)
  }

  const entries: TimetableEntry[] = []
  let skippedAllDay = 0
  for (const ev of events) {
    const start = ev.DTSTART && toMoment(ev.DTSTART as IcsProp)
    if (!start) continue
    if (start.allDay) {
      skippedAllDay++
      continue
    }
    if ((ev.STATUS as IcsProp | undefined)?.value.toUpperCase() === 'CANCELLED') continue
    const end = ev.DTEND ? toMoment(ev.DTEND as IcsProp) : null
    const minutes = end ? minutesBetween(start, end) : 60
    const title = unescapeText((ev.SUMMARY as IcsProp | undefined)?.value ?? 'Session') || 'Session'
    const room = unescapeText((ev.LOCATION as IcsProp | undefined)?.value ?? '') || null
    const uid = (ev.UID as IcsProp | undefined)?.value ?? newId()
    const isOverride = !!ev['RECURRENCE-ID']
    const ex = new Set(
      ((ev.EXDATE as IcsProp[] | undefined) ?? []).flatMap((p) =>
        p.value.split(',').map((v) => toMoment({ value: v, params: p.params })?.date ?? ''),
      ),
    )
    const rrule = isOverride ? undefined : (ev.RRULE as IcsProp | undefined)?.value
    const series = rrule ? newId() : null
    const module = detectModule(`${title} ${room ?? ''}`, moduleCodes)
    for (const at of expand(start, rrule, ex)) {
      if (at.date < from || at.date > to) continue
      if (!isOverride && rrule && overridden.has(`${uid}|${at.date}`)) continue
      entries.push({
        id: newId(),
        series,
        date: at.date,
        start: at.time,
        end: addMinutes(at.time, minutes),
        title,
        module,
        room,
        isAssessment: ASSESSMENT_WORDS.test(title),
        source: 'calendar',
      })
    }
  }
  entries.sort((a, b) => sessionKey(a).localeCompare(sessionKey(b)))
  return { entries, skippedAllDay }
}

function minutesBetween(a: Moment, b: Moment): number {
  if (a.utc && b.utc) return Math.max(15, Math.round((b.utc.getTime() - a.utc.getTime()) / 60000))
  const [ah, am] = a.time.split(':').map(Number)
  const [bh, bm] = b.time.split(':').map(Number)
  return Math.max(15, daysBetween(a.date, b.date) * 1440 + (bh * 60 + bm) - (ah * 60 + am))
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const t = Math.min(23 * 60 + 59, h * 60 + m + mins)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
