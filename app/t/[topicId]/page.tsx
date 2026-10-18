import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TopicView } from '@/components/topic/TopicView'
import { getAllTopics, getModuleTopics, getTopic } from '@/lib/content'
import { decksForTopic } from '@/lib/slides'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllTopics().map((x) => ({ topicId: x.topic.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }): Promise<Metadata> {
  const { topicId } = await params
  return { title: getTopic(topicId)?.topic.title ?? 'Topic' }
}

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const found = getTopic(topicId)
  if (!found) notFound()
  const { topic, module } = found
  const siblings = getModuleTopics(module.code)
  const index = siblings.findIndex((s) => s.id === topic.id)
  const prev = siblings[index - 1]
  const next = siblings[index + 1]
  return (
    <TopicView
      topic={topic}
      moduleCode={module.code}
      moduleName={module.name}
      moduleColour={module.colour}
      index={index}
      total={siblings.length}
      prev={prev && { id: prev.id, title: prev.title }}
      next={next && { id: next.id, title: next.title }}
      decks={decksForTopic(topic.id)}
    />
  )
}
