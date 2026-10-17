import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintView } from '@/components/topic/PrintView'
import { getAllTopics, getTopic } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllTopics().map((x) => ({ topicId: x.topic.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }): Promise<Metadata> {
  const { topicId } = await params
  return { title: `Print · ${getTopic(topicId)?.topic.title ?? 'Topic'}` }
}

export default async function PrintPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const found = getTopic(topicId)
  if (!found) notFound()
  return <PrintView topic={found.topic} moduleCode={found.module.code} moduleName={found.module.name} />
}
