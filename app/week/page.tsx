import { typeLabel } from '@/components/bits'
import { WeekSummary } from '@/components/week/WeekSummary'
import { getAllTopics, getTimetable } from '@/lib/content'

export const metadata = { title: 'Your week' }

export default function WeekPage() {
  const topics = getAllTopics().map(({ topic, module }) => ({ id: topic.id, title: topic.title, moduleCode: module.code }))
  const sessions = getTimetable()
    .sessions.filter((s) => s.type !== 'Independent Study')
    .map((s) => ({ date: s.date, title: s.theme ? `${typeLabel(s.type)} · ${s.theme}` : typeLabel(s.type), module: s.module, isAssessment: s.isAssessment }))
  return <WeekSummary topics={topics} sessions={sessions} />
}
