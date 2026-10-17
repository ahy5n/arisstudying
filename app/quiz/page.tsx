import { QuizPage } from '@/components/practice/QuizPage'
import { getPracticeItems } from '@/lib/content'

export const metadata = { title: 'Quick quiz' }

export default function QuickQuiz() {
  return (
    <QuizPage
      items={getPracticeItems().filter((i) => i.kind === 'mcq')}
      mode="quick"
      title="Quick quiz"
      subtitle="Ten questions from across your modules, leaning towards ones that tripped you up before."
      backHref="/"
      backLabel="Home"
    />
  )
}
