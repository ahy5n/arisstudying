import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TopicQuiz } from '@/components/practice/TopicQuiz'
import { getAllTopics, getTopic, getTopicQuizItems } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllTopics()
    .filter((x) => x.topic.mcq.length || x.topic.cases.length)
    .map((x) => ({ topicId: x.topic.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }): Promise<Metadata> {
  const { topicId } = await params
  return { title: `${getTopic(topicId)?.topic.title ?? 'Topic'} quiz` }
}

export default async function TopicQuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const found = getTopic(topicId)
  if (!found) notFound()
  return (
    <TopicQuiz
      topicId={topicId}
      topicTitle={found.topic.title}
      moduleCode={found.module.code}
      items={getTopicQuizItems(topicId)}
    />
  )
}
