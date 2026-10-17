import { Tracker, type SeedAssessment } from '@/components/tracker/Tracker'
import { getModules, getTimetable } from '@/lib/content'

export const metadata = { title: '70% tracker' }

export default function TrackerPage() {
  const seeds: SeedAssessment[] = getTimetable()
    .sessions.filter((s) => s.isAssessment)
    .map((s) => ({
      name: `${s.module ?? 'Module'} ${/prac/i.test(s.type) ? 'practical assessment' : 'assessment'}`,
      module: s.module ?? '',
      date: s.date,
    }))
  return <Tracker seeds={seeds} moduleCodes={getModules().map((m) => m.code)} />
}
