import { QuizPage } from '@/components/practice/QuizPage'
import { TopicQuizList } from '@/components/practice/TopicQuizList'
import { getPracticeItems, getTopicQuizIndex } from '@/lib/content'

export const metadata = { title: 'Quizzes' }

export default function QuickQuiz() {
  return (
    <div className="mx-auto max-w-[760px]">
      <QuizPage
        items={getPracticeItems().filter((i) => i.kind !== 'flashcard')}
        mode="quick"
        title="Quick quiz"
        subtitle="Ten questions from across your modules, leaning towards ones that tripped you up before."
        backHref="/"
        backLabel="Home"
      />
      <TopicQuizList groups={getTopicQuizIndex()} />
    </div>
  )
}
