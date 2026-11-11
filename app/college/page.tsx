import Link from 'next/link'
import { BackLink } from '@/components/bits'
import { CollegeIndex } from '@/components/college/CollegeIndex'
import { getCollege } from '@/lib/college'

export const metadata = { title: 'College guidance' }

export default function CollegePage() {
  const d = getCollege()
  return (
    <div className="mx-auto max-w-[820px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">College of Optometrists guidance</h1>
      <p className="mt-1 text-muted">
        The College’s Clinical Management Guidelines and Guidance for Professional Practice, summarised for revision. Each page links to the
        College’s full version, which is what to follow in practice.
      </p>
      <Link href="/college/referrals" className="card mt-5 flex items-center justify-between gap-3 px-5 py-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
        <div>
          <p className="font-rounded text-[17px] font-semibold">How urgently to refer</p>
          <p className="text-[14px] text-muted">The College’s urgency of referrals table, by condition</p>
        </div>
        <span className="text-accent">→</span>
      </Link>
      <CollegeIndex cmgs={d.cmgs} guidance={d.guidance} />
    </div>
  )
}
