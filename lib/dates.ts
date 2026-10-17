// Dates are plain "YYYY-MM-DD" strings in UK time, so a session on
// Monday is Monday whatever the device clock's zone is.

const ukDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const ukHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hourCycle: 'h23' })

export function todayISO(now: Date = new Date()): string {
  return ukDate.format(now)
}

export function ukHourNow(now: Date = new Date()): number {
  return Number(ukHour.format(now))
}

function toUTC(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function addDays(iso: string, n: number): string {
  const d = toUTC(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(iso: string): number {
  return (toUTC(iso).getUTCDay() + 6) % 7
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayIndex(iso))
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86400000)
}

export function isValidISO(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUTC(s).getTime())
}

const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short' })
const dayLongFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'short' })
const shortFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' })

export const fmtDay = (iso: string) => dayFmt.format(toUTC(iso))
export const fmtDayLong = (iso: string) => dayLongFmt.format(toUTC(iso))
export const fmtShort = (iso: string) => shortFmt.format(toUTC(iso))

/** "19–23 Oct" or "30 Nov – 4 Dec" */
export function fmtRange(fromISO: string, toISO: string): string {
  const a = toUTC(fromISO)
  const b = toUTC(toISO)
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${shortFmt.format(b)}`
  return `${shortFmt.format(a)} – ${shortFmt.format(b)}`
}
