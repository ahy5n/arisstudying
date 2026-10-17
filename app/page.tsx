import { AskClaudeButton } from '@/components/AskClaudeButton'
import { Greeting } from '@/components/home/Greeting'
import { Library } from '@/components/home/Library'
import { NextTwoWeeks } from '@/components/home/NextTwoWeeks'
import { VerseCard } from '@/components/home/VerseCard'
import { toLibraryModule } from '@/lib/progress'
import { getChecklists, getEncouragements, getModules, getPracticeItems, getTimetable, getVerses } from '@/lib/content'

const TUTOR_PROMPT =
  'I’m a 2nd-year MOptom optometry student at Aston. I’d like some help studying. Ask me which module and topic I’m working on, then explain it simply and quiz me with a few questions.'

export default function HomePage() {
  const modules = getModules()
  const { weeks, sessions } = getTimetable()
  const colours = Object.fromEntries(modules.map((m) => [m.code, m.colour]))
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 space-y-6">
        <Greeting lines={getEncouragements()} />
        <VerseCard verses={getVerses()} />
        <NextTwoWeeks weeks={weeks} sessions={sessions} colours={colours} />
        <AskClaudeButton text={TUTOR_PROMPT} label="Ask my tutor" variant="primary" className="w-full sm:w-auto" />
      </div>
      <div className="min-w-0 lg:pt-2">
        <Library
          modules={modules.map(toLibraryModule)}
          weeks={weeks}
          knownItemIds={getPracticeItems().map((i) => i.id)}
          checklistCount={getChecklists().length}
        />
      </div>
    </div>
  )
}
