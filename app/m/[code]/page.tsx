import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModuleView } from '@/components/module/ModuleView'
import { getModule, getModules, getPracticeItems, getStaff, getTimetable, getVerifyNote } from '@/lib/content'
import { decksForModule, materialsBySession } from '@/lib/slides'

export const dynamicParams = false

export function generateStaticParams() {
  return getModules().map((m) => ({ code: m.code }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const m = getModule(code)
  return { title: m ? `${m.code} · ${m.name}` : 'Module' }
}

export default async function ModulePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const m = getModule(code)
  if (!m) notFound()
  const staff = getStaff()
  const leads = m.lead
    .split('/')
    .map((s) => s.trim())
    .filter((i) => staff[i])
    .map((i) => ({ initials: i, ...staff[i] }))
  const sessions = getTimetable().sessions.filter((s) =>
    (s.module ?? '').split('/').map((x) => x.trim()).includes(m.code),
  )
  const colours = Object.fromEntries(getModules().map((x) => [x.code, x.colour]))
  return (
    <ModuleView
      module={m}
      leads={leads}
      sessions={sessions}
      colours={colours}
      verifyNote={getVerifyNote(m.code)}
      questionCount={getPracticeItems(m.code).filter((i) => i.kind === 'mcq').length}
      materials={materialsBySession()}
      decks={decksForModule(m.code)}
    />
  )
}
