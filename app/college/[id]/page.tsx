import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/bits'
import { getCollege, getCollegeEntry } from '@/lib/college'

export const dynamicParams = false

export function generateStaticParams() {
  const d = getCollege()
  return [...d.cmgs, ...d.guidance].map((x) => ({ id: x.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: getCollegeEntry(id)?.item.title ?? 'College guidance' }
}

export default async function CollegeEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = getCollegeEntry(id)
  if (!entry) notFound()
  const { item } = entry
  const label = entry.kind === 'cmg' ? `Clinical Management Guideline · ${entry.item.group}` : `Professional guidance · ${entry.item.domain}`

  return (
    <article className="mx-auto max-w-[720px]">
      <BackLink href="/college">College guidance</BackLink>
      <p className="mt-3 text-[13px] font-medium text-muted">{label}</p>
      <h1 className="mt-1 text-[30px] font-semibold leading-tight">{item.title}</h1>
      {entry.kind === 'cmg' && <p className="mt-3 text-[17px] leading-relaxed">{entry.item.summary}</p>}
      {entry.kind === 'cmg' && entry.item.refer && (
        <p className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-[15px] text-accent-strong">
          <span className="font-semibold">Referral: </span>
          {entry.item.refer}
        </p>
      )}
      <h2 className="mt-6 text-[18px] font-semibold">{entry.kind === 'cmg' ? 'Key points' : 'What it says'}</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-[16px] leading-relaxed">
        {item.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-soft mt-6">
        Read the full College {entry.kind === 'cmg' ? 'guideline' : 'guidance'} ↗
      </a>
      <p className="mt-3 text-[13px] text-muted">
        {entry.kind === 'cmg' ? 'Full CMGs need a free College account. ' : ''}A summary for study, written in our own words. Check the College’s current version
        before using it in practice.
      </p>
    </article>
  )
}
