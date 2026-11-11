import { BackLink } from '@/components/bits'
import { getCollege } from '@/lib/college'

export const metadata = { title: 'How urgently to refer' }

export default function ReferralsPage() {
  const { referrals } = getCollege()
  return (
    <div className="mx-auto max-w-[820px]">
      <BackLink href="/college">College guidance</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">How urgently to refer</h1>
      <p className="mt-1 text-muted">
        Based on Annex 4 of the College’s Guidance for Professional Practice. Local protocols can differ, so check yours.
      </p>
      <div className="mt-6 space-y-8">
        {referrals.rows.map((row) => (
          <section key={row.area}>
            <h2 className="mb-3 text-[20px] font-semibold">{row.area}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {row.cells.map((cell, i) => (
                <div key={referrals.levels[i]} className="card p-4">
                  <p className={`text-[13px] font-semibold uppercase tracking-wide ${i < 2 ? 'text-accent-strong' : 'text-muted'}`}>{referrals.levels[i]}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[15px]">
                    {cell.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <a href={referrals.url} target="_blank" rel="noreferrer" className="btn btn-soft mt-8">
        See the College’s table ↗
      </a>
    </div>
  )
}
