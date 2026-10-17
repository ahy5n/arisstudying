import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { QuizPage } from '@/components/practice/QuizPage'
import { getModule, getModules, getPracticeItems } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return getModules()
    .filter((m) => m.hasContent)
    .map((m) => ({ code: m.code }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  return { title: `${code} quiz` }
}

export default async function ModuleQuiz({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const m = getModule(code)
  if (!m || !m.hasContent) notFound()
  const items = getPracticeItems(code).filter((i) => i.kind === 'mcq')
  return (
    <QuizPage
      items={items}
      mode="all"
      title={`${m.code} quiz`}
      subtitle={`All ${items.length} questions from ${m.name}, in a random order.`}
      backHref={`/m/${m.code}`}
      backLabel={`${m.code} · ${m.name}`}
    />
  )
}
