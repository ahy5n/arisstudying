import { SlidesLibrary, type LibWeek } from '@/components/slides/SlidesLibrary'
import { getModules, getTimetable, getTopic } from '@/lib/content'
import { addDays, fmtDayLong, fmtRange } from '@/lib/dates'
import { getDecks, isOutlined, sessionKey } from '@/lib/slides'

export const metadata = { title: 'Slides & materials' }

export default function SlidesPage() {
  const { weeks, sessions } = getTimetable()
  const decks = getDecks()
  const colours = Object.fromEntries(getModules().map((m) => [m.code, m.colour]))

  const byWeek: LibWeek[] = []
  for (const w of weeks) {
    const wkSessions = sessions
      .filter((s) => s.week === w.week)
      .map((s) => {
        const key = sessionKey(s)
        const ds = decks.filter((d) => d.sessions.some((x) => sessionKey(x) === key))
        return {
          key,
          dayLabel: fmtDayLong(s.date),
          start: s.start,
          end: s.end,
          type: s.type,
          modules: (s.module ?? '').split('/').map((x) => x.trim()).filter(Boolean),
          room: s.room,
          decks: ds.map((d) => ({
            id: d.id,
            title: d.title,
            file: d.file,
            kind: d.kind,
            module: d.module,
            outlined: isOutlined(d),
            slideCount: d.slideCount,
            status: d.status ?? null,
            topics: d.topics.map((t) => ({ id: t, title: getTopic(t)?.topic.title ?? t })),
          })),
        }
      })
      .filter((s) => s.decks.length)
    if (wkSessions.length) byWeek.push({ week: w.week, range: fmtRange(w.monday, addDays(w.monday, 4)), sessions: wkSessions })
  }

  return <SlidesLibrary weeks={byWeek} colours={colours} total={decks.length} outlinedCount={decks.filter(isOutlined).length} />
}
