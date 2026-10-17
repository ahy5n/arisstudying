import Link from 'next/link'
import { BackLink } from '@/components/bits'
import { ChecklistCard } from '@/components/topic/ChecklistCard'
import { getChecklists } from '@/lib/content'

export const metadata = { title: 'Checklists' }

export default function ChecklistsPage() {
  const lists = getChecklists()
  return (
    <div className="mx-auto max-w-[820px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">Checklists</h1>
      <p className="mt-1 text-muted">Step-by-step routines for practicals. Tick as you go, reset when you practise again.</p>
      {lists.length === 0 && <p className="mt-6 text-muted">No checklists yet.</p>}
      <div className="mt-6 space-y-8">
        {lists.map((l) => (
          <section key={l.checklist.id}>
            <p className="mb-2 text-[14px] font-medium text-muted">
              {l.moduleCode} ·{' '}
              <Link href={`/t/${l.topicId}#checklist`} className="underline-offset-4 hover:text-ink hover:underline">
                {l.topicTitle}
              </Link>
            </p>
            <ChecklistCard checklist={l.checklist} />
          </section>
        ))}
      </div>
    </div>
  )
}
